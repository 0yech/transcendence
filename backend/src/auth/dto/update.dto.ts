import { IsEmail, IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class UpdateDto {
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

  @IsNotEmpty()
  @IsUrl()
  pictureUrl!: string;
}
