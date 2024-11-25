import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import * as fs from 'fs';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ResponseDto } from '../../common/response.dto';
import { ROLES } from '../../utils/constants';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: number,
  ): Promise<Document> {
    let filePath;
    if (!createDocumentDto.file) {
      throw new BadRequestException('No file uploaded');
    }
    const file = createDocumentDto.file;

    try {
      const uploadDir = './uploads';

      // Ensure the upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate file path
      const filename = `${Date.now()}-${file.originalname}`;
      filePath = path.join(uploadDir, filename);

      // Write file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create a document record in the database
      const document = this.documentRepository.create({
        name: filename,
        path: filePath,
        type: file.mimetype,
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        userId,
      });

      return this.documentRepository.save(document);
    } catch (error) {
      console.log('Error during document upload: ', error);
      throw new BadRequestException('File upload failed');
    }
  }

  async findAll(
    req,
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponseDto> {
    try {
      const where =
        req.user?.role === ROLES.EDITOR ? { userId: req.user.id } : {};

      const [documents, total] = await this.documentRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        where,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Documents retrieved successfully',
        data: { total, data: documents },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: number) {
    const document = await this.documentRepository.findOneBy({ id });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Document retrieved successfully',
      data: document,
    };
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.documentRepository.findOneBy({ id });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Update document with new data
    Object.assign(document, updateDocumentDto);

    await this.documentRepository.save(document);

    return {
      statusCode: HttpStatus.OK,
      message: 'Document updated successfully',
      data: updateDocumentDto,
    };
  }

  async remove(id: number) {
    const document = await this.documentRepository.findOneBy({ id });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Remove the file from the system
    fs.unlinkSync(document.path);

    // Delete document record
    await this.documentRepository.remove(document);

    return {
      statusCode: HttpStatus.OK,
      message: 'Document deleted successfully',
    };
  }
}
