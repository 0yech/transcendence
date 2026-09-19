import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { trimIfString } from '../../common/trim.util';

/**
 * @brief Validates a guild name, used both to create and to rename a guild.
 *
 * Same rules as `validateGuildName()` in the guilds service.
 *
 * The guild forms mirror them as HTML attributes, so the browser can reject
 * bad input without a round trip. Keep them in sync with
 * `frontend/app/components/guilds/GuildCreation.tsx` and `GuildDetails.tsx`.
 */
export class GuildNameDto {
  @IsNotEmpty({ message: 'Please choose a guild name.' })
  @IsString({ message: 'Your guild name must be text.' })
  @Length(3, 20, {
    message:
      'A guild name must be between $constraint1 and $constraint2 characters.',
  })
  @Matches(/^[a-zA-Z0-9 _-]+$/, {
    message:
      'A guild name can only contain letters, numbers, spaces, underscores and hyphens.',
  })
  @Transform(trimIfString)
  name!: string;
}
