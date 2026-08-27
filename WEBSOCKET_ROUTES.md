# WebSocket Routes

This document describes the Socket.IO namespaces and events exposed by the backend.

> Source of truth: gateway files under `backend/src/`.
>
> Game WebSocket behavior reflects the `feat/ws-game` pull request state reviewed on 2026-08-15.

The backend uses Socket.IO for real-time game state and lobby chat delivery.

For browser clients, the existing authentication cookie can be reused. Register server-event listeners before emitting the corresponding join event so that initial updates are not missed.

## Game WebSocket

**Namespace:** `/games`

**Authentication:** Required

The gateway reads the `access_token` cookie during the Socket.IO handshake.

If the cookie is missing or invalid, the server emits `game:error`:

```json
{
  "message": "Unauthorized"
}
```

and then disconnects the socket.

### Recommended integration order

```text
1. Connect to /games with the access_token cookie.
2. Register the game:state listener.
3. Register the game:error listener.
4. Emit game:join with the lobby code.
5. Wait for the game:join acknowledgement.
6. If no game exists yet, wait until someone emits game:start.
7. Receive game:state whenever the game starts or an action succeeds.
8. On the current player's turn, emit the appropriate game action.
9. Continue rendering from each new game:state.
```

> `game:join` should be emitted before `game:start` or any gameplay action. The current gateway does not use room membership itself as an authorization requirement for every action, so clients should still follow this order.

### `game:join`

Joins the Socket.IO room associated with an active lobby.

A player may join before the game has started.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12"
}
```

The lobby code is trimmed and normalized to uppercase.

**Requirements**

- The lobby must exist and be active.
- The authenticated user must belong to the lobby.

**Acknowledgement**

```json
{
  "ok": true,
  "lobbyCode": "ABCD12"
}
```

**Server events**

If a game is already in progress, the joining socket immediately receives a personalized `game:state`.

### `game:start`

Starts a new ONO99 game from the lobby.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12"
}
```

**Requirements**

- The lobby must exist and be active.
- The authenticated user must belong to the lobby.
- The lobby must contain at least 2 players.
- The lobby must contain at most 6 players.
- The lobby must not already have a game in progress.

**Acknowledgement**

```json
{
  "ok": true
}
```

**Server events**

After the game is created, every connected game player in the lobby room receives their own personalized `game:state`.

### `game:play-slot`

Plays a card using its one-based position in the authenticated player's hand.

This is the preferred hand-selection event in the current gateway.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12",
  "slot": 1
}
```

| Field       | Type    | Required | Description                      |
| ----------- | ------- | -------: | -------------------------------- |
| `lobbyCode` | string  |      Yes | Lobby containing the active game |
| `slot`      | integer |      Yes | Hand position from `1` to `4`    |

**Requirements**

- A game must be in progress for the lobby.
- The authenticated user must be an active player.
- It must be the authenticated user's turn.
- The selected slot must contain a card.
- The selected card must be legal for the current game state.

**Acknowledgement**

```json
{
  "ok": true
}
```

**Server events**

A successful action broadcasts a new personalized `game:state` to the connected players in the game room.

### `game:play-card`

Plays a card using its exact internal card ID.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12",
  "cardId": "card-id"
}
```

| Field       | Type   | Required | Description                                           |
| ----------- | ------ | -------: | ----------------------------------------------------- |
| `lobbyCode` | string |      Yes | Lobby containing the active game                      |
| `cardId`    | string |      Yes | Exact ID of a card in the authenticated player's hand |

**Requirements**

- A game must be in progress for the lobby.
- The authenticated user must be an active player.
- It must be the authenticated user's turn.
- The card must exist in the player's hand.
- The card must be legal for the current game state.

**Acknowledgement**

```json
{
  "ok": true
}
```

**Server events**

A successful action broadcasts a new personalized `game:state`.

### `game:unable`

Declares that the current player has no legal move.

The backend verifies this declaration; the client cannot eliminate itself while a legal move still exists.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12"
}
```

**Requirements**

- A game must be in progress for the lobby.
- The authenticated user must be the current active player.
- The player's hand must contain no playable card.
- The player must not have four ONO99 cards available for the special discard action.

**Acknowledgement**

```json
{
  "ok": true
}
```

**Server events**

A successful action broadcasts a new personalized `game:state`.

### `game:discard-four-ono99`

Uses the special action that discards four ONO99 cards from the current player's hand.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyCode": "ABCD12"
}
```

**Requirements**

- A game must be in progress for the lobby.
- The authenticated user must be the current active player.
- The player must have four ONO99 cards.

**Acknowledgement**

```json
{
  "ok": true
}
```

**Server events**

A successful action broadcasts a new personalized `game:state`.

### `game:state`

Contains the current frontend-safe game state.

**Direction:** Server → Client

The state is generated separately for every player. A player receives their own hand, while other players expose only `handCount`.

**Payload shape**

```json
{
  "id": "game-id",
  "lobbyId": "lobby-id",
  "status": "IN_PROGRESS",
  "seedHash": "public-seed-hash",
  "total": 42,
  "direction": 1,
  "currentPlayerId": "user-id",
  "lastPlayedById": "user-id",
  "winnerId": null,
  "pendingPlays": 1,
  "turnNumber": 3,
  "deckCount": 35,
  "discardPile": [],
  "players": [
    {
      "userId": "user-id",
      "username": "player1",
      "avatarUrl": null,
      "seat": 0,
      "status": "ACTIVE",
      "handCount": 4,
      "hand": []
    },
    {
      "userId": "other-user-id",
      "username": "player2",
      "avatarUrl": null,
      "seat": 1,
      "status": "ACTIVE",
      "handCount": 4
    }
  ]
}
```

> `hand` is only present for the player receiving that personalized state.

### `game:error`

Connection-level authentication error.

**Direction:** Server → Client

Current payload:

```json
{
  "message": "Unauthorized"
}
```

After this event, the gateway disconnects the unauthenticated socket.

Game action failures are converted to NestJS `WsException` errors. Clients should also handle WebSocket exception responses for invalid state, permissions, invalid payload values and missing games/lobbies.

---

## Chat WebSocket

**Namespace:** `/chats`

**Authentication:** Required

The chat gateway accepts the JWT from the first available source:

1. `handshake.auth.token`
2. `Authorization: Bearer <token>` handshake header
3. `access_token` cookie

A missing or invalid token causes the socket to disconnect.

Chat messages themselves are **not** created through WebSocket. They are created with `POST /api/lobbies/:code/messages`; after persistence, the server broadcasts `message:created`.

### Recommended integration order

```text
1. Connect to /chats.
2. Register the message:created listener.
3. Emit lobby:join with the public lobby code.
4. Wait for the lobby:join acknowledgement.
5. GET /api/lobbies/:code/messages to load history.
6. Merge history with any received message:created events, deduplicating by message id.
7. POST /api/lobbies/:code/messages whenever the user sends a message.
8. Receive message:created for newly persisted messages.
9. Emit lobby:leave when the socket should stop receiving events for that lobby.
```

### `lobby:join`

Joins the Socket.IO room associated with an active lobby chat.

**Direction:** Client → Server

**Payload**

```json
{
  "code": "ABCD12"
}
```

**Requirements**

- The lobby must exist and be active.
- The authenticated user must currently belong to the lobby.

**Acknowledgement**

```json
{
  "success": true,
  "lobbyCode": "ABCD12"
}
```

After this acknowledgement, the socket can receive `message:created` broadcasts for that lobby.

### `message:created`

Broadcast when a message has been successfully persisted through the REST API.

**Direction:** Server → Client

**Payload**

```json
{
  "id": "message-id",
  "content": "Hello!",
  "createdAt": "2026-08-15T12:00:00.000Z",
  "updatedAt": "2026-08-15T12:00:00.000Z",
  "author": {
    "id": "user-id",
    "username": "player1",
    "avatarUrl": null
  }
}
```

The payload is the same public message representation returned by the HTTP message routes.

### `lobby:leave`

Leaves a lobby chat Socket.IO room for the current socket only.

This does **not** remove the user from the lobby database. Use the HTTP lobby leave route for that.

**Direction:** Client → Server

**Payload**

```json
{
  "lobbyId": "internal-lobby-id"
}
```

> This event currently expects the internal lobby ID, unlike `lobby:join`, which expects the public lobby code.

**Acknowledgement**

```json
{
  "success": true
}
```

---
