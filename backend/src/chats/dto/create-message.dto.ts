import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * @brief Validates the payload used to create a chat message.
 */
export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
