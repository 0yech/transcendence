import { IsNotEmpty, IsString } from 'class-validator';
import { GameActionDto } from './game-action.dto';

/**
 * @brief Validates the payload of the `game:play-card` event.
 */
export class PlayCardDto extends GameActionDto {
  @IsString({ message: 'The card id must be text.' })
  @IsNotEmpty({ message: 'A card id is required.' })
  cardId!: string;
}
