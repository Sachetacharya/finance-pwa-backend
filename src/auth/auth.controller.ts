import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 registrations/min
  @ApiOperation({ summary: 'Register a new user' })
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { ttl: 60000, limit: 8 } }) // 8 login attempts/min
  @ApiOperation({ summary: 'Login with email and password' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req, @Body() _dto: LoginDto) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.getProfile(user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update display name' })
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @CurrentUser() user: { userId: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
