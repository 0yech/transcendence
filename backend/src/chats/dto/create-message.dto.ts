import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * @brief Validates the payload used to create a chat message.
 *
 * The chat box mirrors the 500-character limit as a `maxLength` attribute.
 * Keep them in sync with `frontend/app/components/LobbyChat.tsx`.
 */
export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
