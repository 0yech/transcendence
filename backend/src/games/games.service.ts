import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createSeededOno99Deck, dealHands } from './ono99.deck';
import { createPrivateSeed, hashSeed } from './seeded-rng';
import { Ono99Card } from './ono99.types';
import {
  applyCardToTotal,
  canPlayCard,
  drawUntilFour,
  hasFourOno99,
  hasPlayableCard,
  removeCardFromHand,
  removeFourOno99,
} from './ono99.rules';

type GamePlayerWithUser = {
  id: string;
  gameId?: string;
  userId: string;
  seat: number;
  status: string;
  hand: unknown;
  eliminatedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
};

type GameWithPlayers = {
  id: string;
  lobbyId: string;
  status: string;
  seedPrivate: string;
  seedHash: string;
  total: number;
  direction: number;
  currentPlayerId: string | null;
  lastPlayedById: string | null;
  winnerId: string | null;
  pendingPlays: number;
  turnNumber: number;
  reshuffleIndex: number;
  deck: unknown;
  discardPile: unknown;
  players: GamePlayerWithUser[];
};

/**
 * @brief Handles ONO99 game creation, state updates and replay data.
 *
 * This service owns the backend-authoritative game logic:
 * seeded deck generation, player turns, card validation, eliminations,
 * private hands, lightweight replay actions and public game views.
 *
 * Game actions require a JWT-protected user and never trust client-provided
 * player identity.
 */
@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @brief Starts a new ONO99 game from an active lobby.
   *
   * Creates a private deterministic seed, shuffles the deck, deals four cards
   * to each lobby user, creates the game state cache and stores the initial
   * GAME_STARTED replay action.
   *
   * @param lobbyId The internal id of the lobby used to start the game.
   * @param requesterId The authenticated user id requesting the game start.
   * @return The newly created public game view for the requester.
   *
   * @throws NotFoundException If the lobby does not exist or is inactive.
   * @throws ForbiddenException If the requester is not in the lobby.
   * @throws BadRequestException If the lobby has less than 2 players, more than 6 players,
   * or already has an active game.
   */
  async startFromLobby(lobbyCode: string, requesterId: string) {
    const normalizedCode = lobbyCode.trim().toUpperCase();

    const lobby = await this.prisma.lobby.findFirst({
      where: {
        code: normalizedCode,
        active: true,
      },
      include: {
        users: {
          orderBy: {
            updatedAt: 'asc',
          },
        },
      },
    });

    if (!lobby) {
      throw new NotFoundException(
        `Active lobby with code ${normalizedCode} not found`,
      );
    }

    const requesterIsInLobby = lobby.users.some(
      (user: { id: string }) => user.id === requesterId,
    );

    if (!requesterIsInLobby) {
      throw new ForbiddenException('You are not in this lobby');
    }

    if (lobby.users.length < 2) {
      throw new BadRequestException('Need at least 2 players');
    }

    if (lobby.users.length > 6) {
      throw new BadRequestException('ONO99 supports max 6 players here');
    }

    const activeGame = await this.prisma.game.findFirst({
      where: {
        lobbyId: lobby.id,
        status: 'IN_PROGRESS',
      },
    });

    if (activeGame) {
      throw new BadRequestException('This lobby already has an active game');
    }

    const seedPrivate = createPrivateSeed();
    const seedHash = hashSeed(seedPrivate);

    const deck = createSeededOno99Deck(seedPrivate);
    const dealt = dealHands(deck, lobby.users.length);

    const game = await this.prisma.game.create({
      data: {
        lobbyId: lobby.id,

        seedPrivate,
        seedHash,

        total: 0,
        direction: 1,

        currentPlayerId: lobby.users[0].id,

        pendingPlays: 1,
        turnNumber: 1,

        deck: dealt.drawPile as any,
        discardPile: [],

        players: {
          create: lobby.users.map((user: { id: string }, seat: number) => ({
            userId: user.id,
            seat,
            status: 'ACTIVE',
            hand: dealt.hands[seat] as any,
          })),
        },

        actions: {
          create: {
            actorUserId: requesterId,
            type: 'GAME_STARTED',
            sequence: 0,
            turnNumber: 0,
            payload: {
              seedHash,
              playerOrder: lobby.users.map(
                (user: { id: string }, seat: number) => ({
                  userId: user.id,
                  seat,
                }),
              ),
            },
          },
        },
      },

      include: this.gameInclude(),
    });

    return this.toPublicGame(game as unknown as GameWithPlayers, requesterId);
  }

  /**
   * @brief Retrieves the current public state of a game.
   *
   * The returned view includes the authenticated player's hand, but hides
   * every other player's hand and only exposes their hand count.
   *
   * @param gameId The id of the game to retrieve.
   * @param userId The authenticated user id.
   * @return The public game view customized for the authenticated player.
   *
   * @throws NotFoundException If the game does not exist.
   * @throws ForbiddenException If the user is not a player in the game.
   */
  async getGame(gameId: string, userId: string) {
    const game = await this.getFullGame(gameId);
    this.assertPlayerInGame(game, userId);

    return this.toPublicGame(game, userId);
  }

  /**
   * @brief Plays a card by its visible hand slot.
   *
   * Converts a slot into the matching card id from the authenticated
   * player's current hand, then delegates to the regular card-playing logic.
   *
   * Slot mapping:
   * - 1 => first card in hand
   * - 2 => second card in hand etc
   *
   * @param gameId The id of the game.
   * @param userId The authenticated user id.
   * @param slot The index of the card to play.
   * @return The updated public game view after the card is played.
   *
   * @throws BadRequestException If the slot is not an integer between 1 and 4,
   * or if there is no card in the requested slot.
   * @throws ForbiddenException If the user is not active in the game or it is not their turn.
   * @throws NotFoundException If the game does not exist.
   */
  async playSlot(gameId: string, userId: string, slot: number) {
    if (!Number.isInteger(slot)) {
      throw new BadRequestException('slot must be an integer');
    }

    if (slot < 1 || slot > 4) {
      throw new BadRequestException('slot must be between 1 and 4');
    }

    const game = await this.getFullGame(gameId);

    this.assertInProgress(game);
    this.assertPlayerInGame(game, userId);
    this.assertCurrentPlayer(game, userId);

    const player = game.players.find(
      (p: GamePlayerWithUser) => p.userId === userId,
    );

    if (!player || player.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not active in this game');
    }

    const hand = player.hand as Ono99Card[];
    const card = hand[slot - 1];

    if (!card) {
      throw new BadRequestException(`No card in slot ${slot}`);
    }

    return this.playCard(gameId, userId, card.id);
  }

  /**
   * @brief Plays a card by its internal card id.
   *
   * Validates that the authenticated player is the current active player,
   * checks whether the chosen card is legal, applies ONO99 rules, updates
   * the player's hand, updates the game state and stores a replay action.
   *
   * @param gameId The id of the game.
   * @param userId The authenticated user id.
   * @param cardId The internal id of the card to play.
   * @return The updated public game view after the action is resolved.
   *
   * @throws BadRequestException If the card id is missing, the card is not in the hand,
   * or the card cannot legally be played.
   * @throws ForbiddenException If the user is not in the game, is not active,
   * or it is not their turn.
   * @throws NotFoundException If the game does not exist.
   */
  async playCard(gameId: string, userId: string, cardId: string) {
    if (!cardId || typeof cardId !== 'string') {
      throw new BadRequestException('cardId is required');
    }

    const game = await this.getFullGame(gameId);

    this.assertInProgress(game);
    this.assertPlayerInGame(game, userId);
    this.assertCurrentPlayer(game, userId);

    const player = game.players.find(
      (p: GamePlayerWithUser) => p.userId === userId,
    );

    if (!player || player.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not active in this game');
    }

    const hand = player.hand as Ono99Card[];
    const { card, hand: handAfterRemove } = removeCardFromHand(hand, cardId);

    if (!canPlayCard(card, game.total)) {
      throw new BadRequestException('Illegal card');
    }

    const totalBefore = game.total;
    const totalAfter = applyCardToTotal(card, game.total);

    let direction = game.direction;

    const activeCount = game.players.filter(
      (p: GamePlayerWithUser) => p.status === 'ACTIVE',
    ).length;

    const wasUnderPlayTwo = game.pendingPlays === 2;

    if (card.type === 'REVERSE' && activeCount > 2) {
      direction *= -1;
    }

    const discardPile = [...(game.discardPile as Ono99Card[]), card];

    const draw = drawUntilFour({
      hand: handAfterRemove,
      deck: game.deck as Ono99Card[],
      discardPile,
      privateSeed: game.seedPrivate,
      reshuffleIndex: game.reshuffleIndex,
    });

    await this.prisma.gamePlayer.update({
      where: { id: player.id },
      data: {
        hand: draw.hand as any,
      },
    });

    const nextTurn = this.resolveNextTurn({
      game,
      userId,
      card,
      direction,
      wasUnderPlayTwo,
    });

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        total: totalAfter,
        direction,
        currentPlayerId: nextTurn.currentPlayerId,
        pendingPlays: nextTurn.pendingPlays,
        lastPlayedById: userId,
        turnNumber: { increment: 1 },
        reshuffleIndex: draw.reshuffleIndex,
        deck: draw.deck as any,
        discardPile: draw.discardPile as any,
        actions: {
          create: {
            actorUserId: userId,
            type: 'CARD_PLAYED',
            sequence: await this.nextSequence(gameId),
            turnNumber: game.turnNumber,
            payload: {
              cardId: card.id,
              slotPlayed:
                hand.findIndex(
                  (handCard: Ono99Card) => handCard.id === card.id,
                ) + 1,
              card: {
                type: card.type,
                value: card.value,
                label: card.label,
              },
              totalBefore,
              totalAfter,
              pendingPlaysBefore: game.pendingPlays,
              pendingPlaysAfter: nextTurn.pendingPlays,
              directionBefore: game.direction,
              directionAfter: direction,
            },
          },
        },
      },
      include: this.gameInclude(),
    });

    return this.finishIfNeeded(updated as unknown as GameWithPlayers, userId);
  }

  /**
   * @brief Declares that the current player cannot play any legal card.
   *
   * The backend verifies the declaration before eliminating the player.
   * A player cannot use this route if they still have a playable card or
   * if they can discard four ONO99 cards.
   *
   * @param gameId The id of the game.
   * @param userId The authenticated user id.
   * @return The updated public game view after the player is eliminated,
   * or the finished game view if this elimination ends the game.
   *
   * @throws BadRequestException If the game is not in progress or the player still has a legal move.
   * @throws ForbiddenException If the user is not in the game, is not active,
   * or it is not their turn.
   * @throws NotFoundException If the game does not exist.
   */
  async unableToPlay(gameId: string, userId: string) {
    const game = await this.getFullGame(gameId);

    this.assertInProgress(game);
    this.assertPlayerInGame(game, userId);
    this.assertCurrentPlayer(game, userId);

    const player = game.players.find(
      (p: GamePlayerWithUser) => p.userId === userId,
    );

    if (!player || player.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not active in this game');
    }

    const hand = player.hand as Ono99Card[];

    if (hasPlayableCard(hand, game.total) || hasFourOno99(hand)) {
      throw new BadRequestException('You still have a legal move');
    }

    await this.prisma.gamePlayer.update({
      where: { id: player.id },
      data: {
        status: 'ELIMINATED',
        eliminatedAt: new Date(),
      },
    });

    await this.prisma.gameAction.create({
      data: {
        gameId,
        actorUserId: userId,
        type: 'PLAYER_ELIMINATED',
        sequence: await this.nextSequence(gameId),
        turnNumber: game.turnNumber,
        payload: {
          reason: 'NO_LEGAL_MOVE',
          total: game.total,
        },
      },
    });

    const refreshed = await this.getFullGame(gameId);

    const activePlayers = refreshed.players.filter(
      (p: GamePlayerWithUser) => p.status === 'ACTIVE',
    );

    if (activePlayers.length === 1) {
      return this.finishGame(gameId, activePlayers[0].userId, userId);
    }

    const nextPlayerId = this.findNextActivePlayerId(
      refreshed,
      userId,
      refreshed.direction,
    );

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        currentPlayerId: nextPlayerId,
        pendingPlays: 1,
        turnNumber: { increment: 1 },
      },
      include: this.gameInclude(),
    });

    return this.finishIfNeeded(updated as unknown as GameWithPlayers, userId);
  }

  /**
   * @brief Discards four ONO99 cards from the current player's hand.
   *
   * If the player has four ONO99 cards, they may discard all four at once,
   * add nothing to the pile total, draw back to four cards and continue the game.
   *
   * @param gameId The id of the game.
   * @param userId The authenticated user id.
   * @return The updated public game view after the ONO99 discard action.
   *
   * @throws BadRequestException If the game is not in progress or the player
   * does not have four ONO99 cards.
   * @throws ForbiddenException If the user is not in the game, is not active,
   * or it is not their turn.
   * @throws NotFoundException If the game does not exist.
   */
  async discardFourOno99(gameId: string, userId: string) {
    const game = await this.getFullGame(gameId);

    this.assertInProgress(game);
    this.assertPlayerInGame(game, userId);
    this.assertCurrentPlayer(game, userId);

    const player = game.players.find(
      (p: GamePlayerWithUser) => p.userId === userId,
    );

    if (!player || player.status !== 'ACTIVE') {
      throw new ForbiddenException('You are not active in this game');
    }

    const removed = removeFourOno99(player.hand as Ono99Card[]);

    const discardPile = [
      ...(game.discardPile as Ono99Card[]),
      ...removed.removed,
    ];

    const draw = drawUntilFour({
      hand: removed.hand,
      deck: game.deck as Ono99Card[],
      discardPile,
      privateSeed: game.seedPrivate,
      reshuffleIndex: game.reshuffleIndex,
    });

    await this.prisma.gamePlayer.update({
      where: { id: player.id },
      data: {
        hand: draw.hand as any,
      },
    });

    const next =
      game.pendingPlays === 2
        ? { currentPlayerId: userId, pendingPlays: 1 }
        : {
            currentPlayerId: this.findNextActivePlayerId(
              game,
              userId,
              game.direction,
            ),
            pendingPlays: 1,
          };

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        currentPlayerId: next.currentPlayerId,
        pendingPlays: next.pendingPlays,
        turnNumber: { increment: 1 },
        reshuffleIndex: draw.reshuffleIndex,
        deck: draw.deck as any,
        discardPile: draw.discardPile as any,
        actions: {
          create: {
            actorUserId: userId,
            type: 'FOUR_ONO99_DISCARDED',
            sequence: await this.nextSequence(gameId),
            turnNumber: game.turnNumber,
            payload: {
              cardIds: removed.removed.map((card: Ono99Card) => card.id),
              totalBefore: game.total,
              totalAfter: game.total,
            },
          },
        },
      },
      include: this.gameInclude(),
    });

    return this.finishIfNeeded(updated as unknown as GameWithPlayers, userId);
  }

  /**
   * @brief Retrieves the replay data for a game.
   *
   * Returns the public seed hash, player order and ordered game actions.
   * The private seed, deck cache and hidden hands are never returned.
   *
   * @param gameId The id of the game.
   * @param userId The authenticated user id.
   * @return The replay metadata and ordered list of public game actions.
   *
   * @throws NotFoundException If the game does not exist.
   * @throws ForbiddenException If the user is not a player in the game.
   */
  async getReplay(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          orderBy: { seat: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        actions: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    this.assertPlayerInGame(game as unknown as GameWithPlayers, userId);

    return {
      id: game.id,
      lobbyId: game.lobbyId,
      status: game.status,
      seedHash: game.seedHash,
      total: game.total,
      winnerId: game.winnerId,
      players: game.players.map((player: GamePlayerWithUser) => ({
        userId: player.userId,
        seat: player.seat,
        username: player.user?.username,
        avatarUrl: player.user?.avatarUrl,
      })),
      actions: game.actions.map((action: any) => ({
        type: action.type,
        actorUserId: action.actorUserId,
        sequence: action.sequence,
        turnNumber: action.turnNumber,
        payload: action.payload,
        createdAt: action.createdAt,
      })),
    };
  }

  /**
   * @brief Resolves which player should act after a card is played.
   *
   * Handles normal turns, Play 2, Reverse responses to Play 2 and the second
   * required play after a Play 2 effect.
   *
   * @param params.game The current game state.
   * @param params.userId The user id of the player who just played.
   * @param params.card The card that was just played.
   * @param params.direction The direction after applying the card effect.
   * @param params.wasUnderPlayTwo Whether the player was resolving a Play 2 effect.
   * @return The next current player id and the next pending play count.
   */
  private resolveNextTurn(params: {
    game: GameWithPlayers;
    userId: string;
    card: Ono99Card;
    direction: number;
    wasUnderPlayTwo: boolean;
  }) {
    const { game, userId, card, direction, wasUnderPlayTwo } = params;

    if (card.type === 'PLAY_TWO') {
      return {
        currentPlayerId: this.findNextActivePlayerId(game, userId, direction),
        pendingPlays: 2,
      };
    }

    if (wasUnderPlayTwo && card.type === 'REVERSE') {
      return {
        currentPlayerId: this.findNextActivePlayerId(game, userId, direction),
        pendingPlays: 2,
      };
    }

    if (wasUnderPlayTwo) {
      return {
        currentPlayerId: userId,
        pendingPlays: 1,
      };
    }

    return {
      currentPlayerId: this.findNextActivePlayerId(game, userId, direction),
      pendingPlays: 1,
    };
  }

  /**
   * @brief Finds the next active player in turn order.
   *
   * Starts from the given user id and walks through the seated players using
   * the current direction until it finds a player with ACTIVE status.
   *
   * @param game The current game state.
   * @param fromUserId The user id to start from.
   * @param direction The turn direction, either 1 or -1.
   * @return The user id of the next active player.
   *
   * @throws BadRequestException If the starting player cannot be found or
   * no active player is available.
   */
  private findNextActivePlayerId(
    game: GameWithPlayers,
    fromUserId: string,
    direction: number,
  ) {
    const players = [...game.players].sort(
      (a: GamePlayerWithUser, b: GamePlayerWithUser) => a.seat - b.seat,
    );

    const startIndex = players.findIndex(
      (p: GamePlayerWithUser) => p.userId === fromUserId,
    );

    if (startIndex === -1) {
      throw new BadRequestException('Player not found');
    }

    let index = startIndex;

    for (let i = 0; i < players.length; i++) {
      index = (index + direction + players.length) % players.length;

      if (players[index].status === 'ACTIVE') {
        return players[index].userId;
      }
    }

    throw new BadRequestException('No active player found');
  }

  /**
   * @brief Finishes the game if a winning condition has been reached.
   *
   * A game ends when only one active player remains, or when no active player
   * can legally play and the last player to successfully play a card wins.
   *
   * @param game The current game state after an action.
   * @param viewerId The authenticated user id used to customize the returned public view.
   * @return The finished game view if the game ended, otherwise the current public game view.
   */
  private async finishIfNeeded(game: GameWithPlayers, viewerId: string) {
    const active = game.players.filter(
      (p: GamePlayerWithUser) => p.status === 'ACTIVE',
    );

    if (active.length === 1) {
      return this.finishGame(game.id, active[0].userId, viewerId);
    }

    const nobodyCanPlay = active.every((player: GamePlayerWithUser) => {
      const hand = player.hand as Ono99Card[];
      return !hasPlayableCard(hand, game.total) && !hasFourOno99(hand);
    });

    if (nobodyCanPlay && game.lastPlayedById) {
      return this.finishGame(game.id, game.lastPlayedById, viewerId);
    }

    return this.toPublicGame(game, viewerId);
  }

  /**
   * @brief Marks a game as finished and stores the winner.
   *
   * Updates the winner's player status, clears the current turn, stores a
   * GAME_FINISHED replay action and returns the final public game view.
   *
   * @param gameId The id of the game to finish.
   * @param winnerId The user id of the winning player.
   * @param viewerId The authenticated user id used to customize the returned public view.
   * @return The final public game view.
   */
  private async finishGame(gameId: string, winnerId: string, viewerId: string) {
    await this.prisma.gamePlayer.updateMany({
      where: {
        gameId,
        userId: winnerId,
      },
      data: {
        status: 'WINNER',
      },
    });

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        winnerId,
        currentPlayerId: null,
        pendingPlays: 0,
        finishedAt: new Date(),
        actions: {
          create: {
            actorUserId: winnerId,
            type: 'GAME_FINISHED',
            sequence: await this.nextSequence(gameId),
            turnNumber: 0,
            payload: {
              winnerId,
            },
          },
        },
      },
      include: this.gameInclude(),
    });

    return this.toPublicGame(updated as unknown as GameWithPlayers, viewerId);
  }

  /**
   * @brief Computes the next replay action sequence number for a game.
   *
   * Sequence numbers are monotonic inside a single game and are used to replay
   * actions in the exact order they happened.
   *
   * @param gameId The id of the game.
   * @return The next available action sequence number.
   */
  private async nextSequence(gameId: string) {
    const last = await this.prisma.gameAction.findFirst({
      where: { gameId },
      orderBy: { sequence: 'desc' },
    });

    return last ? last.sequence + 1 : 0;
  }

  /**
   * @brief Loads a game with its ordered players and user display data.
   *
   * This method returns the internal game state, including private fields such
   * as seedPrivate, deck and player hands. It must never be returned directly
   * to the frontend.
   *
   * @param gameId The id of the game to load.
   * @return The internal game state with players.
   *
   * @throws NotFoundException If the game does not exist.
   */
  private async getFullGame(gameId: string): Promise<GameWithPlayers> {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: this.gameInclude(),
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game as unknown as GameWithPlayers;
  }

  /**
   * @brief Builds the Prisma include object used to load game players.
   *
   * Players are ordered by seat and include minimal public user display data.
   *
   * @return The Prisma include object for game queries.
   */
  private gameInclude() {
    return {
      players: {
        orderBy: {
          seat: 'asc' as const,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    };
  }

  /**
   * @brief Ensures that a game is currently in progress.
   *
   * @param game The game state to validate.
   *
   * @throws BadRequestException If the game is not in progress.
   */
  private assertInProgress(game: GameWithPlayers) {
    if (game.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Game is not in progress');
    }
  }

  /**
   * @brief Ensures that a user is one of the players in the game.
   *
   * @param game The game state to validate.
   * @param userId The authenticated user id.
   *
   * @throws ForbiddenException If the user is not a player in the game.
   */
  private assertPlayerInGame(game: GameWithPlayers, userId: string) {
    const isPlayer = game.players.some(
      (player: GamePlayerWithUser) => player.userId === userId,
    );

    if (!isPlayer) {
      throw new ForbiddenException('You are not in this game');
    }
  }

  /**
   * @brief Ensures that the authenticated user is the current player.
   *
   * @param game The game state to validate.
   * @param userId The authenticated user id.
   *
   * @throws ForbiddenException If it is not the user's turn.
   */
  private assertCurrentPlayer(game: GameWithPlayers, userId: string) {
    if (game.currentPlayerId !== userId) {
      throw new ForbiddenException('It is not your turn');
    }
  }

  /**
   * @brief Converts an internal game state into a safe public game view.
   *
   * The returned object exposes public game information, the discard pile and
   * hand counts for all players. It only includes the hand of the authenticated
   * viewer and never exposes the private seed or deck contents.
   *
   * @param game The internal game state.
   * @param viewerId The authenticated user id used to decide which hand to reveal.
   * @return A frontend-safe public game view.
   */
  private toPublicGame(game: GameWithPlayers, viewerId: string) {
    return {
      id: game.id,
      lobbyId: game.lobbyId,
      status: game.status,

      seedHash: game.seedHash,

      total: game.total,
      direction: game.direction,
      currentPlayerId: game.currentPlayerId,
      lastPlayedById: game.lastPlayedById,
      winnerId: game.winnerId,
      pendingPlays: game.pendingPlays,
      turnNumber: game.turnNumber,

      deckCount: Array.isArray(game.deck) ? game.deck.length : 0,
      discardPile: Array.isArray(game.discardPile) ? game.discardPile : [],

      players: game.players.map((player: GamePlayerWithUser) => ({
        userId: player.userId,
        username: player.user?.username,
        avatarUrl: player.user?.avatarUrl,
        seat: player.seat,
        status: player.status,
        handCount: Array.isArray(player.hand) ? player.hand.length : 0,

        /**
         * Only the current authenticated player receives their own hand.
         */
        hand: player.userId === viewerId ? player.hand : undefined,
      })),
    };
  }
}
