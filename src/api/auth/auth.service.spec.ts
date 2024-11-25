import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null); // No existing user
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'hashedPassword',
      } as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockedToken');

      const result = await authService.register(createUserDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'john.doe@mailinator.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass@1', 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'john.doe@mailinator.com' },
        { secret: process.env.JWT_SECRET },
      );
      expect(result).toEqual({
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@mailinator.com',
          accessToken: 'mockedToken',
        },
      });
    });

    it('should throw an error if email is already in use', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: 1,
        name: 'Existing User',
        email: 'john.doe@mailinator.com',
        password: 'hashedPassword',
      } as User);

      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };

      await expect(authService.register(createUserDto)).rejects.toThrow(
        new BadRequestException({
          statusCode: 400,
          message: 'Email already in use',
          error: 'Email already in use',
        }),
      );
    });
  });

  describe('AuthService - Register - Missing Fields', () => {
    it('should throw an error if name is missing', async () => {
      const createUserDto = {
        email: 'test@mailinator.com',
        password: 'StrongPass@1',
      };

      await expect(authService.register(createUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if email is missing', async () => {
      const createUserDto = {
        name: 'John Doe',
        password: 'StrongPass@1',
      };

      await expect(authService.register(createUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if password is missing', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'test@mailinator.com',
      };

      await expect(authService.register(createUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if all fields are missing', async () => {
      const createUserDto = {};

      await expect(authService.register(createUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: await bcrypt.hash('StrongPass@1', 10),
      } as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mockedToken');

      const result = await authService.login(loginUserDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'john.doe@mailinator.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'StrongPass@1',
        expect.any(String),
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'john.doe@mailinator.com' },
        { secret: process.env.JWT_SECRET },
      );
      expect(result).toEqual({
        statusCode: 200,
        message: 'User logged in successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@mailinator.com',
          accessToken: 'mockedToken',
        },
      });
    });

    it('should throw an error if email does not exist', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const loginUserDto: LoginUserDto = {
        email: 'invalid.email@mailinator.com',
        password: 'WrongPass',
      };

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });
  });

  describe('AuthService - Login - Missing Fields', () => {
    it('should throw an error if email is missing', async () => {
      const loginUserDto = {
        password: 'StrongPass@1',
      };

      await expect(authService.login(loginUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if password is missing', async () => {
      const loginUserDto = {
        email: 'test@mailinator.com',
      };

      await expect(authService.register(loginUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if all fields are missing', async () => {
      const loginUserDto = {};

      await expect(authService.register(loginUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
