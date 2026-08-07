/**
 * offer.service.ts
 * ────────────────
 * Business logic for the Offers domain.
 * Depends on IOfferRepository and IRestaurantRepository — not concrete classes.
 */
import { AppError } from '../../shared/errors/AppError';
import { IOffer } from './offer.model';
import { IOfferRepository } from './interfaces';
import { IRestaurantRepository } from '../restaurants/interfaces';
import { CreateOfferDTO, UpdateOfferDTO } from './dto';

export class OfferService {
  constructor(
    private readonly repo: IOfferRepository,
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  /** Public: all currently active (non-expired) offers */
  async getActiveOffers(): Promise<IOffer[]> {
    return this.repo.findActive();
  }

  /** Public: single offer by id */
  async getById(id: string): Promise<IOffer> {
    const offer = await this.repo.findById(id);
    if (!offer) throw new AppError('Offer not found', 404);
    return offer;
  }

  /** Public: all offers for a specific restaurant */
  async getByRestaurant(restaurantId: string): Promise<IOffer[]> {
    return this.repo.findByRestaurant(restaurantId);
  }

  /** Admin: all offers regardless of status */
  async getAll(): Promise<IOffer[]> {
    return this.repo.findAll();
  }

  /** Seller: create an offer for their restaurant */
  async create(ownerId: string, dto: CreateOfferDTO): Promise<IOffer> {
    const restaurant = await this.restaurantRepo.findByOwnerId(ownerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    return this.repo.create({
      title:          dto.title,
      description:    dto.description ?? '',
      discount:       dto.discount,
      image:          dto.image ?? '',
      bgColor:        dto.bgColor ?? '#FF6B00',
      validUntil:     new Date(dto.validUntil),
      restaurantId:   restaurant._id as any,
      restaurantName: restaurant.name,
    });
  }

  /** Seller: update their own offer */
  async update(ownerId: string, offerId: string, dto: UpdateOfferDTO): Promise<IOffer> {
    await this.assertOwnership(ownerId, offerId);
    const updated = await this.repo.update(offerId, {
      ...dto,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    } as any);
    if (!updated) throw new AppError('Offer not found', 404);
    return updated;
  }

  /** Seller: delete their own offer */
  async delete(ownerId: string, offerId: string): Promise<void> {
    await this.assertOwnership(ownerId, offerId);
    await this.repo.delete(offerId);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

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
