import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Please enter your username.' })
  @IsString({ message: 'Your username must be text.' })
  username!: string;

  @IsNotEmpty({ message: 'Please enter your password.' })
  @IsString({ message: 'Your password must be text.' })
  password!: string;
}
