import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ROLES } from '../..//utils/constants';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUserByAdmin', () => {
    it('should successfully create a user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
        role: ROLES.ADMIN,
      };

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const newUser = {
        ...createUserDto,
        password: hashedPassword,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null); // Mocking findByEmail to return null (no user exists)
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser as any);

      const response = await usersService.createUserByAdmin(createUserDto);
      expect(response.data.email).toBe(createUserDto.email);
    });

    it('should throw error if user already exists', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john.doe@mailinator.com',
        password: 'StrongPass@1',
        role: ROLES.ADMIN,
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({} as any);

      await expect(
        usersService.createUserByAdmin(createUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('should throw validation error if required fields are missing', async () => {
    const invalidUserDto: CreateUserDto = {
      name: '',
      email: '',
      password: '',
      role: '' as unknown as ROLES,
    };

    await expect(
      usersService.createUserByAdmin(invalidUserDto),
    ).rejects.toThrow(BadRequestException);
  });

  
});
