import { IOffer } from '../offer.model';

export interface IOfferRepository {
  create(data: Partial<IOffer>): Promise<IOffer>;
  findById(id: string): Promise<IOffer | null>;
  findActive(): Promise<IOffer[]>;
  findByRestaurant(restaurantId: string): Promise<IOffer[]>;
  findAll(): Promise<IOffer[]>;
  update(id: string, data: Partial<IOffer>): Promise<IOffer | null>;
  delete(id: string): Promise<void>;
}
