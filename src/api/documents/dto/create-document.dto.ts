import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @Type(() => String)
  file: Express.Multer.File;

  @ApiProperty({ example: 'Document title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Some document description' })
  @IsString()
  description: string;
}
