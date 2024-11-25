import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ROLES } from '../../../utils/constants';

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'john.doe@mailinator.com' })
  email?: string;

  @IsEnum(ROLES)
  @IsOptional()
  @ApiProperty({ example: ROLES.EDITOR })
  role?: ROLES;
}
