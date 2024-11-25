import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: Repository<Document>;

  const mockDocumentRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<Repository<Document>>(getRepositoryToken(Document));
    (fs.unlinkSync as jest.Mock) = jest.fn();
  });

  describe('create', () => {
    it('should create and save a new document', async () => {
      const createDocumentDto = {
        title: 'document 1',
        description: 'document 2',
      };
      const file: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-file.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('dummy content'),
        size: 1024,
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const mockDocument = {
        id: 1,
        name: 'test-file.png',
        path: './uploads/¡-test-file.png',
        type: 'image/png',
        title: 'document 1',
        description: 'document 2',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fs methods
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'mkdirSync').mockImplementation();
      jest.spyOn(fs, 'writeFileSync').mockImplementation();
      jest.spyOn(global.Date, 'now').mockImplementation(() => 1693257600000);

      // Mock path.join to return consistent file path
      jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));

      // Mock repository methods
      mockDocumentRepository.create.mockReturnValue(mockDocument);
      mockDocumentRepository.save.mockResolvedValue(mockDocument);

      // Call the service method
      const result = await service.create({ ...createDocumentDto, file }, 1);

      // Assertions
      expect(fs.existsSync).toHaveBeenCalledWith('./uploads');
      expect(fs.mkdirSync).toHaveBeenCalledWith('./uploads', {
        recursive: true,
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        './uploads/1693257600000-test-file.png',
        file.buffer,
      );
      expect(mockDocumentRepository.create).toHaveBeenCalledWith({
        name: expect.stringContaining('test-file.png'),
        path: expect.stringContaining('./uploads/'),
        type: file.mimetype,
        title: createDocumentDto.title,
        description: createDocumentDto.description,
        userId: 1,
      });
      expect(mockDocumentRepository.save).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual(mockDocument);
    });

    it('should throw error if file is not provided', async () => {
      const createDocumentDto = {
        file: null,
        title: 'Test Document',
        description: 'Test Document Description',
      };

      await expect(service.create(createDocumentDto, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a document if found', async () => {
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

      mockDocumentRepository.findOneBy.mockResolvedValue(document);

      const result = await service.findOne(1);

      expect(mockDocumentRepository.findOneBy).toHaveBeenCalledWith({ id: document.id });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Document retrieved successfully',
        data: document,
      });
    });

    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const documents = [
        {
          id: 1,
          name: 'test1.pdf',
          title: 'Test Document 1',
          description: 'Test Document 1 Description',
          path: './uploads/test1.pdf',
          type: 'application/pdf',
          userId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'test2.pdf',
          title: 'Test Document 2',
          description: 'Test Document 2 Description',
          path: './uploads/test2.pdf',
          type: 'application/pdf',
          userId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDocumentRepository.findAndCount.mockResolvedValue([
        documents,
        documents.length,
      ]);

      const result = await service.findAll({ user: { role: 'admin' } });

      expect(mockDocumentRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Documents retrieved successfully',
        data: { total: 2, data: documents },
      });
    });
  });

  describe('remove', () => {
    it('should remove a document', async () => {
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

      mockDocumentRepository.findOneBy.mockResolvedValue(document);
      mockDocumentRepository.remove.mockResolvedValue(document);

      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      const result = await service.remove(1);

      expect(mockDocumentRepository.findOneBy).toHaveBeenCalledWith({
        id: document.id,
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(document.path);
      expect(mockDocumentRepository.remove).toHaveBeenCalledWith(document);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Document deleted successfully',
      });
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockDocumentRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockDocumentRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
