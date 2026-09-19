import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @brief Validates the payload shared by every game action event.
 *
 * `normalizeLobbyCode()` in the gateway still trims and uppercases the code:
 * this only guarantees it is a non-empty string before it gets there.
 */
export class GameActionDto {
  @IsString({ message: 'The lobby code must be text.' })
  @IsNotEmpty({ message: 'A lobby code is required.' })
  lobbyCode!: string;
}
