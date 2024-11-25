import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDto } from '../../common/response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockReq = {
    user: {
      id: 1,
      role: 'EDITOR',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDocument', () => {
    it('should successfully create a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'This is a test document.',
        file: {
          buffer: Buffer.from('test content'),
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
        } as Express.Multer.File,
      };
    
      const mockReq = {
        user: {
          id: 1,
          role: 'EDITOR',
        },
      };
    
      const document = {
        id: 7,
        name: 'Screenshot from 2023-01-20 18-48-15.png',
        path: './uploads/Screenshot from 2023-01-20 18-48-15.png',
        title: 'document updated',
        description: 'document 2',
        type: 'image/png',
        userId: 1,
        createdAt: '2024-11-24T10:55:04.992Z',
        updatedAt: '2024-11-24T11:05:37.193Z',
      };
    
      const result = {
        statusCode: HttpStatus.CREATED,
        message: 'Document created successfully',
        data: document, // The data field contains the document object
      };
    
      // Mock the service response
      mockDocumentService.create.mockResolvedValue(result);
    
      const response = await controller.createDocument(
        createDocumentDto.file,
        createDocumentDto,
        mockReq,
      );
    
      // Test the structure of the response
      expect(response).toEqual(result); // Now the structure should match
    
      // Ensure the service method is called correctly
      expect(mockDocumentService.create).toHaveBeenCalledWith(
        { ...createDocumentDto, file: createDocumentDto.file },
        mockReq.user.id,
      );
    });
    

    it('should throw BadRequestException if no file is uploaded', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: 'Test Document',
        description: 'This is a test document.',
        file: undefined,
      };

      const file = undefined;

      await expect(
        controller.createDocument(file, createDocumentDto, mockReq),
      ).rejects.toThrowError(new BadRequestException('No file uploaded'));
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const result: ResponseDto = {
        statusCode: 200,
        message: 'Documents retrieved successfully',
        data: {
          total: 1,
          documents: [{ id: 1, title: 'Test Document' }],
        },
      };

      mockDocumentService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(mockReq)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      const document = {
        id: 1,
        name: 'test.pdf',
        title: 'Test Document',
        description: 'Test Document Description',
        path: './uploads/test.pdf',
        type: 'application/pdf',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResponse = {
        statusCode: 200,
        message: 'Document retrieved successfully',
        data: document, // The document data should be inside the 'data' field
      };

      mockDocumentService.findOne.mockResolvedValue(document);

      const response = await controller.findOne('1');

      expect(response).toEqual(expectedResponse); // Test structure match
    });
    

    it('should throw NotFoundException if document does not exist', async () => {
      mockDocumentService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const id = 1;
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Test Document',
        description: 'Updated description for the document.',
      };

      const updatedDocument = {
        statusCode: HttpStatus.OK,
        message: 'Document updated successfully',
        data: {
          id,
          title: 'Updated Test Document',
          description: 'Updated description for the document.',
          path: 'updated/path',
          type: 'application/pdf',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockDocumentService.update.mockResolvedValue(updatedDocument);

      const response = await controller.update(id, updateDocumentDto);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.message).toBe('Document updated successfully');
      expect(response.data).toEqual(updatedDocument.data);
    });

    it('should throw NotFoundException if document does not exist', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        title: 'Updated Test Document',
      };

      mockDocumentService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update(999, updateDocumentDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
      const result = {
        statusCode: 200,
        message: 'Document deleted successfully',
      };

      mockDocumentService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockDocumentService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
