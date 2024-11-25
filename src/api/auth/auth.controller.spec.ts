import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponse } from './dto/register-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register and return the result', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };
      const result: AuthResponse = {
        statusCode: 201,
        message: 'User registered successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@mailinator.com',
          accessToken: 'fakeToken',
        },
      };

      mockAuthService.register.mockResolvedValue(result);

      expect(await authController.register(createUserDto)).toEqual(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw a BadRequestException if service throws an error', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Email already in use'),
      );

      await expect(authController.register(createUserDto)).rejects.toThrow(
        'Email already in use',
      );
    });

    it('should throw a BadRequestException if service throws an error', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };

      mockAuthService.register.mockRejectedValue(
        new Error('Email already in use'),
      );

      await expect(authController.register(createUserDto)).rejects.toThrow(
        'Email already in use',
      );
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the result', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
      };
      const result: AuthResponse = {
        statusCode: 200,
        message: 'User logged in successfully',
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@mailinator.com',
          accessToken: 'fakeToken',
        },
      };

      mockAuthService.login.mockResolvedValue(result);

      expect(await authController.login(loginUserDto)).toEqual(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginUserDto);
    });
  });
});
