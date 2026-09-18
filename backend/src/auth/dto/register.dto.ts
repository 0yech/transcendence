import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * @brief Validates the payload used to register an account.
 *
 * The register form mirrors these lengths as HTML attributes, so the browser
 * can reject bad input without a round trip. Keep them in sync with
 * `frontend/app/pages/auth/register.tsx`.
 */
export class RegisterDto {
  @IsNotEmpty({ message: 'Please enter your email address.' })
  @IsString({ message: 'Your email address must be text.' })
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Length(4, 128, {
    message:
      'Your email address must be between $constraint1 and $constraint2 characters.',
  })
  email!: string;

  @IsNotEmpty({ message: 'Please choose a username.' })
  @IsString({ message: 'Your username must be text.' })
  @Length(3, 32, {
    message:
      'Your username must be between $constraint1 and $constraint2 characters.',
  })
  username!: string;

  @IsNotEmpty({ message: 'Please choose a password.' })
  @IsString({ message: 'Your password must be text.' })
  @Length(8, 64, {
    message:
      'Your password must be between $constraint1 and $constraint2 characters.',
  })
  password!: string;
}
