import { IOffer, Offer } from './offer.model';
import { IOfferRepository } from './interfaces';

export class OfferRepository implements IOfferRepository {
  async create(data: Partial<IOffer>): Promise<IOffer> {
    return Offer.create(data);
  }

  async findById(id: string): Promise<IOffer | null> {
    return Offer.findById(id);
  }

  async findActive(): Promise<IOffer[]> {
    const now = new Date();
    return Offer.find({ isActive: true, validUntil: { $gte: now } }).sort({ createdAt: -1 });
  }

  async findByRestaurant(restaurantId: string): Promise<IOffer[]> {
    return Offer.find({ restaurantId }).sort({ createdAt: -1 });
  }

  async findAll(): Promise<IOffer[]> {
    return Offer.find().sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IOffer>): Promise<IOffer | null> {
    return Offer.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<void> {
    await Offer.findByIdAndDelete(id);
  }
}
