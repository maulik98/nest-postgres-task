import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseDto } from './common/response.dto';

@Injectable()
export class AppService {
  healthCheck(): ResponseDto {
    return {
      statusCode: HttpStatus.OK,
      message: 'App working perfectly!',
      data: null,
    };
  }
}
