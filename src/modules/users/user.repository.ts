import { IUser, User, UserRole } from './user.model';
import { IUserRepository } from './interfaces';

export class UserRepository implements IUserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password');
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IUser[]> {
    return User.find(filter).select('-password').sort({ createdAt: -1 });
  }

  async findByRole(role: UserRole): Promise<IUser[]> {
    return User.find({ role }).select('-password');
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).select('-password');
  }

  async toggleActive(id: string): Promise<IUser | null> {
    const user = await User.findById(id);
    if (!user) return null;
    user.isActive = !user.isActive;
    return user.save();
  }

  async countByRole(): Promise<Record<string, number>> {
    const result = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    return result.reduce((acc: Record<string, number>, r: { _id: string; count: number }) => {
      acc[r._id] = r.count;
      return acc;
    }, {});
  }
}
