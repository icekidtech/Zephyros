import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService, // Inject JwtService to handle JWT operations
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const newUser = await user.save();
    newUser.password = undefined; // Remove password from the response
    return newUser;
  }

  async logIn(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { userId: user._id, role: user.role }; // Include necessary user details in payload
    const accessToken = await this.jwtService.sign(payload); // Sign the payload to create a token

    return {
      message: `${user.fullName} is logged in successfully`,
      access_token: accessToken,
    };
  }
  

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(role?: UserRole): Promise<User[]> {
    const query = role ? { role } : {};
    return this.userModel.find(query).select('-password');
  }

  async updateUser(id: string, updateUserDto: any): Promise<User> {
    // If password is included, hash it before updating
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    if (!user) throw new NotFoundException('User not found');
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw new NotFoundException('User not found');
    
    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
