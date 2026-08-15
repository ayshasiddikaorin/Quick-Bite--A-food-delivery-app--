import { IUser } from '../user.model';
import { UserRole } from '../../../shared/types';

/**
 * Contract for user data-access.
 * The service depends on this interface — not on the concrete class —
 * making it easy to swap implementations or mock in tests.
 */
export interface IUserRepository {
  create(data: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAll(filter?: Record<string, unknown>): Promise<IUser[]>;
  findByRole(role: UserRole): Promise<IUser[]>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
  toggleActive(id: string): Promise<IUser | null>;
  hardDelete(id: string): Promise<boolean>;
  countByRole(): Promise<Record<string, number>>;
}
