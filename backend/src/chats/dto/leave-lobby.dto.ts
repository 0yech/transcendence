import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @brief Validates the payload of the `lobby:leave` event.
 */
export class LeaveLobbyDto {
  @IsString({ message: 'The lobby id must be text.' })
  @IsNotEmpty({ message: 'A lobby id is required.' })
  lobbyId!: string;
}
