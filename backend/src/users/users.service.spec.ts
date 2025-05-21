import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let jwtService: JwtService;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    new: jest.fn(),
    save: jest.fn(),
  };

  const mockUser = {
    _id: 'someId',
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.SUPPLIER,
    toObject: jest.fn().mockReturnValue({
      _id: 'someId',
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: UserRole.SUPPLIER,
    }),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('testToken'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.SUPPLIER,
      };

      mockUserModel.findOne.mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      mockUserModel.new = jest.fn().mockImplementation(() => mockUser);
      mockUser.save.mockResolvedValueOnce(mockUser);

      const result = await service.register(createUserDto);
      expect(result).toEqual(expect.objectContaining({
        _id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
      }));
      expect(result.password).toBeUndefined();
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.SUPPLIER,
      };

      mockUserModel.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('logIn', () => {
    it('should login successfully with valid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce('testToken');

      const result = await service.logIn(loginUserDto);
      expect(result).toEqual({
        message: 'Test User is logged in successfully',
        access_token: 'testToken',
      });
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.logIn(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with non-existent user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValueOnce(null);

      await expect(service.logIn(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      mockUserModel.findById.mockResolvedValueOnce(mockUser);

      const result = await service.findById('someId');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);

      await expect(service.findById('nonExistentId')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users when no role is provided', async () => {
      const mockSelect = jest.fn().mockResolvedValueOnce([mockUser]);
      mockUserModel.find.mockReturnValueOnce({ select: mockSelect });

      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockUserModel.find).toHaveBeenCalledWith({});
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });

    it('should filter users by role when role is provided', async () => {
      const mockSelect = jest.fn().mockResolvedValueOnce([mockUser]);
      mockUserModel.find.mockReturnValueOnce({ select: mockSelect });

      const result = await service.findAll(UserRole.SUPPLIER);
      expect(result).toEqual([mockUser]);
      expect(mockUserModel.find).toHaveBeenCalledWith({ role: UserRole.SUPPLIER });
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateUserDto = { fullName: 'Updated Name' };
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(mockUser);

      const result = await service.updateUser('someId', updateUserDto);
      expect(result).toEqual(expect.objectContaining({
        _id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
      }));
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('someId', updateUserDto, { new: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto = { fullName: 'Updated Name' };
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      await expect(service.updateUser('nonExistentId', updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should hash password when updating password', async () => {
      const updateUserDto = { password: 'newPassword123' };
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('newHashedPassword');

      await service.updateUser('someId', updateUserDto);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('someId', { password: 'newHashedPassword' }, { new: true });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(mockUser);

      const result = await service.updateUserRole('someId', UserRole.MANUFACTURER);
      expect(result).toEqual(expect.objectContaining({
        _id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
      }));
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('someId', { role: UserRole.MANUFACTURER }, { new: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      await expect(service.updateUserRole('nonExistentId', UserRole.MANUFACTURER)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValueOnce(mockUser);

      const result = await service.deleteUser('someId');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValueOnce(null);

      await expect(service.deleteUser('nonExistentId')).rejects.toThrow(NotFoundException);
    });
  });
});