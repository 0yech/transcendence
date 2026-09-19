import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { trimIfString } from '../../common/trim.util';

/**
 * @brief Validates the payload used to invite a user to a guild.
 *
 * There's no length rule: this only looks up an existing username, and those
 * aren't consistently bounded. Registration allows a single character, and
 * OAuth usernames come from the email address with no maximum.
 */
export class InviteUserDto {
  @Transform(trimIfString)
  @IsString({ message: 'The username must be text.' })
  @IsNotEmpty({ message: 'Please enter a username.' })
  username!: string;
}
