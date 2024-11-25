import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthResponse, CreateUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    //     private readonly userRepository: Repository<User>, //     @InjectRepository(User)
    private readonly jwtService: JwtService,
    //     private readonly NotificationServiceHelper: NotificationService,
    //     private readonly membershipService: MembershipService,
    private readonly userService: UsersService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    try {
      // check user exist in system or not
      const { name, email, password } = createUserDto;
      // Check if the email already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
      // Hash the password before saving to DB
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user object and save it to the database
      const newUser = await this.userService.create({
        name,
        email,
        password: hashedPassword,
      });
      const accessToken: string = await this.jwtService.sign(
        {
          email,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );
      delete newUser.password;
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: {
          ...newUser,
          accessToken,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        error: error.message,
      });
    }
  }

  async login(loginData: LoginUserDto): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;
      const user: User | null = await this.userService.findByEmail(email);
      if (user === null) {
        throw new BadRequestException('Invalid credentials');
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch === false) {
        throw new BadRequestException('Invalid credentials');
      }

      const accessToken: string = await this.jwtService.sign(
        {
          email,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      );

      delete user.password;
      return {
        statusCode: HttpStatus.OK,
        data: {
          ...user,
          accessToken,
        },
        message: 'User logged in successfully',
      };
    } catch (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Something went wrong',
        error: error.message,
      });
    }
  }
}
