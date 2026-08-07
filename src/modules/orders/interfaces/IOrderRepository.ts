import { IOrder } from '../order.model';
import { OrderStatus } from '../../../shared/types';

export interface IOrderRepository {
  create(data: Partial<IOrder>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByCustomer(customerId: string): Promise<IOrder[]>;
  findByRestaurant(restaurantId: string): Promise<IOrder[]>;
  findByRider(riderId: string): Promise<IOrder[]>;
  findByStatus(status: OrderStatus): Promise<IOrder[]>;
  findAll(filter?: Record<string, unknown>): Promise<IOrder[]>;
  updateStatus(id: string, status: OrderStatus): Promise<IOrder | null>;
  assignRider(id: string, riderId: string, riderName: string): Promise<IOrder | null>;
  count(filter?: Record<string, unknown>): Promise<number>;
  totalRevenue(): Promise<number>;
  weeklyOrderCounts(): Promise<number[]>;
}
