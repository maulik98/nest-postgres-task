import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/register-user.dto';
import { CreateUserDto as AdminCreateUserDto } from './dto/create-user.dto';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ResponseDto } from 'src/common/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async createUserByAdmin(
    createUserDto: AdminCreateUserDto,
  ): Promise<ResponseDto> {
    try {
      const { name, email, password, role } = createUserDto;

      // Check if the email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      await this.userRepository.save(newUser);
      delete newUser.password;
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: {
          ...newUser,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Something went wrong',
        error: error.message,
      });
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Find the user by ID
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // check email exist to other user or not
    const isUserExist = await this.userRepository.count({
      where: { id: Not(id), email: updateUserDto.email },
    });
    if (isUserExist) {
      throw new NotFoundException('Email is already in use');
    }

    // Merge the updated fields into the existing user
    const updatedUser = Object.assign(user, updateUserDto);

    // Save and return the updated user
    return this.userRepository.save(updatedUser);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({
      email,
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.remove(user);
  }
}
