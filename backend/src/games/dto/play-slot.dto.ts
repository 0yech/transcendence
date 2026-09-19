import { IsInt, Max, Min } from 'class-validator';
import { GameActionDto } from './game-action.dto';

/**
 * @brief Validates the payload of the `game:play-slot` event.
 *
 * A slot is a position in the player's hand, counting from 1. The games
 * service checks the same bounds where the card is actually played, since
 * this class only guards the WebSocket entry point.
 */
export class PlaySlotDto extends GameActionDto {
  @IsInt({ message: 'The slot must be a whole number.' })
  @Min(1, { message: 'The slot must be at least $constraint1.' })
  @Max(4, { message: 'The slot must be at most $constraint1.' })
  slot!: number;
}
