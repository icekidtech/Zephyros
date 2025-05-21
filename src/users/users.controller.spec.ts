import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user.schema';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

const mockUserService = {
  register: jest.fn(),
  logIn: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  updateUser: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.SUPPLIER,
      };
      const expectedResult = { id: 'someId', ...createUserDto };

      jest.spyOn(service, 'register').mockResolvedValue(expectedResult as any);

      expect(await controller.register(createUserDto)).toBe(expectedResult);
      expect(service.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginUserDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = {
        message: 'Test User is logged in successfully',
        access_token: 'token',
      };

      jest.spyOn(service, 'logIn').mockResolvedValue(expectedResult);

      expect(await controller.login(loginUserDto)).toBe(expectedResult);
      expect(service.logIn).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = { user: { userId: 'someId' } };
      const expectedResult = {
        id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
        role: UserRole.SUPPLIER,
      };

      jest.spyOn(service, 'findById').mockResolvedValue(expectedResult as any);

      expect(await controller.getProfile(req)).toBe(expectedResult);
      expect(service.findById).toHaveBeenCalledWith('someId');
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const req = { user: { userId: 'someId' } };
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };
      const expectedResult = {
        id: 'someId',
        fullName: 'Updated Name',
        email: 'test@example.com',
        role: UserRole.SUPPLIER,
      };

      jest.spyOn(service, 'updateUser').mockResolvedValue(expectedResult as any);

      expect(await controller.updateProfile(req, updateUserDto)).toBe(expectedResult);
      expect(service.updateUser).toHaveBeenCalledWith('someId', updateUserDto);
    });
  });

  describe('findAllUsers', () => {
    it('should return all users when no role is specified', async () => {
      const expectedResult = [
        {
          id: '1',
          fullName: 'User 1',
          email: 'user1@example.com',
          role: UserRole.ADMIN,
        },
        {
          id: '2',
          fullName: 'User 2',
          email: 'user2@example.com',
          role: UserRole.SUPPLIER,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult as any);

      expect(await controller.findAllUsers()).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter users by role when role is specified', async () => {
      const role = UserRole.SUPPLIER;
      const expectedResult = [
        {
          id: '2',
          fullName: 'User 2',
          email: 'user2@example.com',
          role: UserRole.SUPPLIER,
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult as any);

      expect(await controller.findAllUsers(role)).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(role);
    });
  });

  describe('updateUserRole', () => {
    it('should update a user role', async () => {
      const id = 'someId';
      const updateUserRoleDto: UpdateUserRoleDto = {
        role: UserRole.MANUFACTURER,
      };
      const expectedResult = {
        id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
        role: UserRole.MANUFACTURER,
      };

      jest.spyOn(service, 'updateUserRole').mockResolvedValue(expectedResult as any);

      expect(await controller.updateUserRole(id, updateUserRoleDto)).toBe(expectedResult);
      expect(service.updateUserRole).toHaveBeenCalledWith(id, updateUserRoleDto.role);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const id = 'someId';
      const expectedResult = {
        id: 'someId',
        fullName: 'Test User',
        email: 'test@example.com',
        role: UserRole.SUPPLIER,
      };

      jest.spyOn(service, 'deleteUser').mockResolvedValue(expectedResult as any);

      expect(await controller.deleteUser(id)).toBe(expectedResult);
      expect(service.deleteUser).toHaveBeenCalledWith(id);
    });
  });
});