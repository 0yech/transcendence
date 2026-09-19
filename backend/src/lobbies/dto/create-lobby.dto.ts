import { IsBoolean, IsOptional } from 'class-validator';

/**
 * @brief Validates the payload used to create a lobby.
 */
export class CreateLobbyDto {
  @IsOptional()
  @IsBoolean({ message: 'The private setting must be true or false.' })
  private?: boolean;
}
