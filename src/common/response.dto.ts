import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseDto {
  @ApiProperty({ required: true, type: Number })
  @Expose()
  statusCode?: number;

  @ApiProperty({ required: true, type: String })
  @Expose()
  message?: string;

  @ApiProperty()
  @Expose()
  errorData?: any;

  @ApiProperty()
  @Expose()
  data?: any;
}
