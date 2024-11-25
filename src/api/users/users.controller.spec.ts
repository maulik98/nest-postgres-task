import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ROLES } from '../../utils/constants';
import { ResponseDto } from 'src/common/response.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  // Mocks
  const mockUsersService = {
    createUserByAdmin: jest.fn(),
    findAll: jest.fn(),
    updateUser: jest.fn(),
    remove: jest.fn(),
  };

  const createUserDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john.doe@mailinator.com',
    password: 'StrongPass@1',
    role: ROLES.ADMIN,
  };

  const mockResponse: ResponseDto = {
    statusCode: 201,
    message: 'User created successfully',
    data: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@mailinator.com',
      role: ROLES.ADMIN,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mocking the JwtAuthGuard as always true
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mocking the RolesGuard as always true
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      mockUsersService.createUserByAdmin.mockResolvedValue(mockResponse);

      const result = await usersController.createUser(createUserDto);

      expect(result).toEqual(mockResponse);
      expect(mockUsersService.createUserByAdmin).toHaveBeenCalledWith(
        createUserDto,
      );
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockUsersService.createUserByAdmin.mockRejectedValue(
        new BadRequestException('User already exists'),
      );

      await expect(
        usersController.createUser(createUserDto),
      ).rejects.toThrowError('User already exists');
    });
  });
});
