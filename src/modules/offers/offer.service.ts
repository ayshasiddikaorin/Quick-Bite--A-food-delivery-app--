import { AppError } from '../../shared/errors/AppError';
import { OfferRepository } from './offer.repository';
import { IOffer } from './offer.model';
import { RestaurantRepository } from '../restaurants/restaurant.repository';

export class OfferService {
  constructor(
    private readonly repo: OfferRepository,
    private readonly restaurantRepo: RestaurantRepository,
  ) {}

  async getActiveOffers(): Promise<IOffer[]> {
    return this.repo.findActive();
  }

  async getById(id: string): Promise<IOffer> {
    const offer = await this.repo.findById(id);
    if (!offer) throw new AppError('Offer not found', 404);
    return offer;
  }

  async getByRestaurant(restaurantId: string): Promise<IOffer[]> {
    return this.repo.findByRestaurant(restaurantId);
  }

  async getAll(): Promise<IOffer[]> {
    return this.repo.findAll();
  }

  async create(ownerId: string, data: Partial<IOffer>): Promise<IOffer> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    return this.repo.create({
      ...data,
      restaurantId: restaurant._id as any,
      restaurantName: restaurant.name,
    });
  }

  async update(ownerId: string, offerId: string, data: Partial<IOffer>): Promise<IOffer> {
    await this.assertOwnership(ownerId, offerId);
    const updated = await this.repo.update(offerId, data);
    if (!updated) throw new AppError('Offer not found', 404);
    return updated;
  }

  async delete(ownerId: string, offerId: string): Promise<void> {
    await this.assertOwnership(ownerId, offerId);
    await this.repo.delete(offerId);
  }

  private async assertOwnership(ownerId: string, offerId: string): Promise<void> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    const offer = await this.repo.findById(offerId);
    if (!offer) throw new AppError('Offer not found', 404);
    if (String(offer.restaurantId) !== String(restaurant._id)) {
      throw new AppError('You do not own this offer', 403);
    }
  }
}
