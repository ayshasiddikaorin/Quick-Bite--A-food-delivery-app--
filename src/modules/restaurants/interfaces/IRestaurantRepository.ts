import { IRestaurant } from '../restaurant.model';

export interface IRestaurantRepository {
  create(data: Partial<IRestaurant>): Promise<IRestaurant>;
  findById(id: string): Promise<IRestaurant | null>;
  findByOwnerId(ownerId: string): Promise<IRestaurant | null>;
  findAll(filter?: Record<string, unknown>): Promise<IRestaurant[]>;
  findApproved(): Promise<IRestaurant[]>;
  update(id: string, data: Partial<IRestaurant>): Promise<IRestaurant | null>;
  approve(id: string): Promise<IRestaurant | null>;
  toggleOpen(id: string): Promise<IRestaurant | null>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  countApproved(): Promise<number>;
}
