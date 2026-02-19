import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'user'])
  role?: string = 'user';
}
