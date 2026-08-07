/**
 * order.service.ts
 * ────────────────
 * Business logic only — no HTTP, no Mongoose imports.
 * All DTOs live in ./dto/, all repository contracts in ./interfaces/.
 */
import { AppError } from '../../shared/errors/AppError';
import { OrderStatus } from '../../shared/types';
import { IOrder } from './order.model';
import { IOrderRepository } from './interfaces';
import { IUserRepository } from '../users/interfaces';
import { IRestaurantRepository } from '../restaurants/interfaces';
import { PlaceOrderDTO, SellerStatsDTO } from './dto';

// ── Allowed status transitions ────────────────────────────────────────────────
const BUYER_CANCELLABLE: OrderStatus[] = ['pending'];

const SELLER_ADVANCE: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};

const RIDER_ADVANCE: Partial<Record<OrderStatus, OrderStatus>> = {
  ready:      'on_the_way',
  on_the_way: 'delivered',
};

export class OrderService {
  constructor(
    private readonly repo:           IOrderRepository,
    private readonly userRepo:       IUserRepository,
    private readonly restaurantRepo: IRestaurantRepository,
  ) {}

  // ── Buyer ──────────────────────────────────────────────────────────────────

  async placeOrder(customerId: string, dto: PlaceOrderDTO): Promise<IOrder> {
    const customer = await this.userRepo.findById(customerId);
    if (!customer) throw new AppError('User not found', 404);

    const order = await this.repo.create({
      customerId:     customer._id as any,
      customerName:   customer.name,
      restaurantId:   dto.restaurantId as any,
      restaurantName: dto.restaurantName,
      items:          dto.items as any,
      subtotal:       dto.subtotal,
      deliveryFee:    dto.deliveryFee,
      discount:       dto.discount,
      tax:            dto.tax,
      total:          dto.total,
      address:        dto.address,
      deliveryType:   dto.deliveryType,
      paymentMethod:  dto.paymentMethod,
      promoCode:      dto.promoCode,
    });

    await this.userRepo.update(customerId, { totalOrders: customer.totalOrders + 1 });
    return order;
  }

  async getMyOrders(customerId: string): Promise<IOrder[]> {
    return this.repo.findByCustomer(customerId);
  }

  async getById(id: string): Promise<IOrder> {
    const order = await this.repo.findById(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<IOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const isBuyer  = String(order.customerId) === userId;
    const isOwner  = !!(await this.restaurantRepo.findByOwnerId(userId));

    if (!isBuyer && !isOwner) throw new AppError('Not authorized', 403);
    if (isBuyer && !BUYER_CANCELLABLE.includes(order.status)) {
      throw new AppError('Order can only be cancelled while pending', 400);
    }

    return (await this.repo.updateStatus(orderId, 'cancelled'))!;
  }

  // ── Seller ─────────────────────────────────────────────────────────────────

  async getRestaurantOrders(sellerId: string): Promise<IOrder[]> {
    const restaurant = await this.restaurantRepo.findByOwnerId(sellerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);
    return this.repo.findByRestaurant(String(restaurant._id));
  }

  async advanceOrderSeller(sellerId: string, orderId: string): Promise<IOrder> {
    const restaurant = await this.restaurantRepo.findByOwnerId(sellerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (String(order.restaurantId) !== String(restaurant._id)) {
      throw new AppError('This order does not belong to your restaurant', 403);
    }

    const next = SELLER_ADVANCE[order.status];
    if (!next) throw new AppError(`Cannot advance order from "${order.status}"`, 400);

    return (await this.repo.updateStatus(orderId, next))!;
  }

  async getSellerStats(sellerId: string): Promise<SellerStatsDTO> {
    const restaurant = await this.restaurantRepo.findByOwnerId(sellerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    const restaurantId = String(restaurant._id);

    const [newOrders, preparing, completed, allOrders] = await Promise.all([
      this.repo.count({ restaurantId, status: { $in: ['pending', 'confirmed'] } }),
      this.repo.count({ restaurantId, status: { $in: ['preparing', 'ready'] } }),
      this.repo.count({ restaurantId, status: 'delivered' }),
      this.repo.findByRestaurant(restaurantId),
    ]);

    const totalSales = allOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const weeklyData: number[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      weeklyData.push(
        await this.repo.count({ restaurantId, createdAt: { $gte: start, $lte: end } }),
      );
    }

    return { newOrders, preparing, completed, totalSales, weeklyData };
  }

  // ── Rider ──────────────────────────────────────────────────────────────────

  async getRiderAvailableOrders(): Promise<IOrder[]> {
    return this.repo.findByStatus('ready');
  }

  async getRiderActiveOrders(riderId: string): Promise<IOrder[]> {
    return this.repo.findByRider(riderId);
  }

  async acceptDelivery(riderId: string, orderId: string): Promise<IOrder> {
    const rider = await this.userRepo.findById(riderId);
    if (!rider) throw new AppError('Rider not found', 404);

    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'ready') throw new AppError('Order is not ready for pickup', 400);

    return (await this.repo.assignRider(orderId, riderId, rider.name))!;
  }

  async advanceOrderRider(riderId: string, orderId: string): Promise<IOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (String(order.riderId) !== riderId) throw new AppError('Not your delivery', 403);

    const next = RIDER_ADVANCE[order.status];
    if (!next) throw new AppError(`Cannot advance order from "${order.status}"`, 400);

    return (await this.repo.updateStatus(orderId, next))!;
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  async getAllOrders(status?: string): Promise<IOrder[]> {
    const filter = status ? { status } : {};
    return this.repo.findAll(filter);
  }
}
