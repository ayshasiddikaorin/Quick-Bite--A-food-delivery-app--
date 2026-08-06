import { AppError } from '../../shared/errors/AppError';
import { signToken } from '../../shared/utils/jwt';
import { UserRepository } from './user.repository';
import { IUser } from './user.model';

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: IUser['role'];
  restaurantName?: string;
  vehicleType?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  role?: IUser['role'];
}

export interface AuthResponse {
  usertoken: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  isPremium: boolean;
  loyaltyPoints: number;
  walletBalance: number;
  totalOrders: number;
  memberSince: Date;
  restaurantName?: string;
  vehicleType?: string;
}

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const exists = await this.repo.findByEmail(dto.email);
    if (exists) throw new AppError('Email already in use', 409);

    const user = await this.repo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      role: dto.role,
      restaurantName: dto.restaurantName,
      vehicleType: dto.vehicleType,
    });

    const usertoken = signToken({ id: String(user._id), role: user.role });
    return this.buildAuthResponse(usertoken, user);
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(dto.email);

    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.isActive) throw new AppError('Your account has been deactivated', 403);

    const match = await user.comparePassword(dto.password);
    if (!match) throw new AppError('Invalid email or password', 401);

    if (dto.role && user.role !== dto.role) {
      throw new AppError(`This account is registered as a ${user.role}`, 403);
    }

    const usertoken = signToken({ id: String(user._id), role: user.role });
    return this.buildAuthResponse(usertoken, user);
  }

  async getProfile(id: string): Promise<IUser> {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(id: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent role escalation through profile update
    delete (data as any).role;
    delete (data as any).password;

    const user = await this.repo.update(id, data);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async listAll(roleFilter?: string): Promise<IUser[]> {
    if (roleFilter && roleFilter !== 'all') {
      return this.repo.findByRole(roleFilter as IUser['role']);
    }
    return this.repo.findAll();
  }

  async toggleActive(id: string): Promise<IUser> {
    const user = await this.repo.toggleActive(id);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // ── Private helpers ──────────────────────────────────────────────────────
  private buildAuthResponse(usertoken: string, user: IUser): AuthResponse {
    return {
      usertoken,
      userId:        String(user._id),
      name:          user.name,
      email:         user.email,
      phone:         user.phone,
      role:          user.role,
      avatar:        user.avatar,
      isPremium:     user.isPremium,
      loyaltyPoints: user.loyaltyPoints,
      walletBalance: user.walletBalance,
      totalOrders:   user.totalOrders,
      memberSince:   user.memberSince,
      restaurantName: user.restaurantName,
      vehicleType:   user.vehicleType,
    };
  }
}
