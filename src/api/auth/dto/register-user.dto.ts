import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ResponseDto } from '../../../common/response.dto';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @IsNotEmpty({ message: 'email should not be empty' })
  @ApiProperty({ example: 'john.doe@mailinator.com' })
  email: string;

  @IsString({ message: 'Password is required' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long',
  })
  @ApiProperty({ example: 'StrongPass@1' })
  password: string;
}

export class AuthResponse extends ResponseDto {
  data: {
    name: string;
    email: string;
    id: number;
    accessToken: string;
  };
}
