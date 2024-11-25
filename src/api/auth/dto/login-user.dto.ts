import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({ example: 'john.doe@mailinator.com' })
  email: string;

  @IsString({ message: 'Password is required' })
  @ApiProperty({ example: 'StrongPass@1' })
  password: string;
}
