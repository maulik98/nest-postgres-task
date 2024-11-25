import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, CreateUserDto } from './dto/register-user.dto';
import { plainToClass } from 'class-transformer';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUser: CreateUserDto): Promise<AuthResponse> {
    const newUser = await this.authService.register(createUser);
    return plainToClass(AuthResponse, newUser);
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDto): Promise<AuthResponse> {
    const user = await this.authService.login(loginUser);
    return plainToClass(AuthResponse, user);
  }
}
