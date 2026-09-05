import { IsEmail, IsOptional, IsString, IsUrl, Length } from 'class-validator';

/**
 * Update fields can be undefined, which wouldn't change the field in the database.
 *
 * `@IsOptional()` is what makes that true: marking a property `?` only tells
 * TypeScript, while class-validator still runs every other decorator against
 * `undefined` and fails. Note it skips null and undefined only, so a caller
 * must omit a field rather than send it as an empty string.
 */
export class UpdateDto {
  @IsOptional()
  @IsString({ message: 'Your email address must be text.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Length(4, 128, {
    message:
      'Your email address must be between $constraint1 and $constraint2 characters.',
  })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Your username must be text.' })
  @Length(3, 32, {
    message:
      'Your username must be between $constraint1 and $constraint2 characters.',
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Your password must be text.' })
  @Length(8, 64, {
    message:
      'Your password must be between $constraint1 and $constraint2 characters.',
  })
  password?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Your picture URL must be a valid web address.' })
  pictureUrl?: string;
}
