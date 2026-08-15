import { IRider } from '../rider.model';

export interface IRiderRepository {
  create(data: Partial<IRider>): Promise<IRider>;
  findByUserId(userId: string): Promise<IRider | null>;
  findById(id: string): Promise<IRider | null>;
  findAll(): Promise<IRider[]>;
  update(id: string, data: Partial<IRider>): Promise<IRider | null>;
  toggleOnline(userId: string): Promise<IRider | null>;
  deleteByUser(userId: string): Promise<void>;
  count(): Promise<number>;
  countOnline(): Promise<number>;
}
