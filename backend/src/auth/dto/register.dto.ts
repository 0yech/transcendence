import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Length(4, 128)
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 32)
  username!: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 64)
  password!: string;
}
