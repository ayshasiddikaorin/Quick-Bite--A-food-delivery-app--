import { IRider, Rider } from './rider.model';
import { IRiderRepository } from './interfaces';

export class RiderRepository implements IRiderRepository {
  async create(data: Partial<IRider>): Promise<IRider> {
    return Rider.create(data);
  }

  async findByUserId(userId: string): Promise<IRider | null> {
    return Rider.findOne({ userId });
  }

  async findById(id: string): Promise<IRider | null> {
    return Rider.findById(id);
  }

  async findAll(): Promise<IRider[]> {
    return Rider.find().sort({ createdAt: -1 });
  }

  async update(id: string, data: Partial<IRider>): Promise<IRider | null> {
    return Rider.findByIdAndUpdate(id, data, { new: true });
  }

  async toggleOnline(userId: string): Promise<IRider | null> {
    const rider = await Rider.findOne({ userId });
    if (!rider) return null;
    rider.isOnline = !rider.isOnline;
    return rider.save();
  }

  async count(): Promise<number> {
    return Rider.countDocuments();
  }

  async countOnline(): Promise<number> {
    return Rider.countDocuments({ isOnline: true });
  }
}
