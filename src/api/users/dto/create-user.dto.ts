import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';
import { ROLES } from '../../../utils/constants';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'john.doe@mailinator.com' })
  email: string;

  @IsString({ message: 'Password is required' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long',
  })
  @ApiProperty({ example: 'StrongPass@1' })
  password: string;

  @IsEnum(ROLES)
  role: ROLES;
}
