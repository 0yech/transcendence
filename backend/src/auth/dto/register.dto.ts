import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

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
  @Length(0, 32, {
    message: 'Your username can be at most $constraint2 characters.',
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
