import { IOrder, Order, OrderStatus } from './order.model';

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    return Order.create(data);
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id);
  }

  async findByCustomer(customerId: string): Promise<IOrder[]> {
    return Order.find({ customerId }).sort({ createdAt: -1 });
  }

  async findByRestaurant(restaurantId: string): Promise<IOrder[]> {
    return Order.find({ restaurantId }).sort({ createdAt: -1 });
  }

  async findByRider(riderId: string): Promise<IOrder[]> {
    return Order.find({ riderId }).sort({ createdAt: -1 });
  }

  async findByStatus(status: OrderStatus): Promise<IOrder[]> {
    return Order.find({ status }).sort({ createdAt: -1 });
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<IOrder[]> {
    return Order.find(filter).sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  async assignRider(id: string, riderId: string, riderName: string): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { riderId, riderName, status: 'on_the_way' },
      { new: true },
    );
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Order.countDocuments(filter);
  }

  async totalRevenue(): Promise<number> {
    const result = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  async weeklyOrderCounts(): Promise<number[]> {
    const days: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      const count = await Order.countDocuments({ createdAt: { $gte: start, $lte: end } });
      days.push(count);
    }
    return days;
  }
}
