import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseDto } from '../../common/response.dto';
import { Roles } from '../auth/roles.decorator';
import { ROLES } from '../../utils/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('')
  @Roles(ROLES.EDITOR, ROLES.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req,
  ) {
    try {
      // Check if file is provided
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      const document = await this.documentsService.create(
        { ...createDocumentDto, file },
        req.user.id,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Document created successfully',
        data: document,
      };
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: error.message,
      });
    }
  }

  @Get()
  async findAll(@Req() req): Promise<ResponseDto> {
    return await this.documentsService.findAll(req);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.documentsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return await this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.documentsService.remove(+id);
  }
}
