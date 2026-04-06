import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return { userId: user._id.toString(), email: user.email, name: user.name };
  }

  async login(user: { userId: string; email: string; name: string }) {
    const payload = { sub: user.userId, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.userId, email: user.email, name: user.name },
    };
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const payload = { sub: user._id.toString(), email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user._id, email: user.email, name: user.name },
    };
  }
}
