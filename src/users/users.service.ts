import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, password: hashed });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    return { id: user._id, name: user.name, email: user.email };
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { name: dto.name }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return { id: user._id, name: user.name, email: user.email };
  }

  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password updated successfully' };
  }
}
