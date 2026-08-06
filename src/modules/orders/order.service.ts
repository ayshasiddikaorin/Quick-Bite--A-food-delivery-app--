import { AppError } from '../../shared/errors/AppError';
import { OrderRepository } from './order.repository';
import { IOrder, OrderStatus } from './order.model';
import { UserRepository } from '../users/user.repository';
import { RestaurantRepository } from '../restaurants/restaurant.repository';

export interface PlaceOrderDTO {
  restaurantId: string;
  restaurantName: string;
  items: {
    menuItemId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  address: string;
  deliveryType: 'standard' | 'express';
  paymentMethod: string;
  promoCode?: string;
}

// Valid status transitions per role
const BUYER_CANCEL: OrderStatus[] = ['pending'];
const SELLER_ADVANCE: Record<string, OrderStatus> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};
const RIDER_ADVANCE: Record<string, OrderStatus> = {
  ready: 'on_the_way',
  on_the_way: 'delivered',
};

export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly userRepo: UserRepository,
    private readonly restaurantRepo: RestaurantRepository,
  ) {}

  async placeOrder(customerId: string, dto: PlaceOrderDTO): Promise<IOrder> {
    const customer = await this.userRepo.findById(customerId);
    if (!customer) throw new AppError('User not found', 404);

    const order = await this.repo.create({
      customerId: customer._id as any,
      customerName: customer.name,
      restaurantId: dto.restaurantId as any,
      restaurantName: dto.restaurantName,
      items: dto.items as any,
      subtotal: dto.subtotal,
      deliveryFee: dto.deliveryFee,
      discount: dto.discount,
      tax: dto.tax,
      total: dto.total,
      address: dto.address,
      deliveryType: dto.deliveryType,
      paymentMethod: dto.paymentMethod,
      promoCode: dto.promoCode,
    });

    // Increment customer total orders
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

  /** Seller: get orders for their restaurant */
  async getRestaurantOrders(sellerId: string): Promise<IOrder[]> {
    const restaurant = await this.restaurantRepo.findByOwnerId(sellerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);
    return this.repo.findByRestaurant(String(restaurant._id));
  }

  /** Seller: advance order status (pending→confirmed→preparing→ready) */
  async advanceOrderSeller(sellerId: string, orderId: string): Promise<IOrder> {
    const restaurant = await this.restaurantRepo.findByOwnerId(sellerId);
    if (!restaurant) throw new AppError('No restaurant found for this seller', 404);

    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (String(order.restaurantId) !== String(restaurant._id)) {
      throw new AppError('This order does not belong to your restaurant', 403);
    }

    const nextStatus = SELLER_ADVANCE[order.status];
    if (!nextStatus) throw new AppError(`Cannot advance order from "${order.status}"`, 400);

    const updated = await this.repo.updateStatus(orderId, nextStatus);
    return updated!;
  }

  /** Seller/buyer: cancel order */
  async cancelOrder(userId: string, orderId: string): Promise<IOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const isBuyer = String(order.customerId) === userId;
    const isOwner = !!(await this.restaurantRepo.findByOwnerId(userId));

    if (!isBuyer && !isOwner) throw new AppError('Not authorized', 403);
    if (!BUYER_CANCEL.includes(order.status) && isBuyer) {
      throw new AppError('Order can only be cancelled while pending', 400);
    }

    const updated = await this.repo.updateStatus(orderId, 'cancelled');
    return updated!;
  }

  /** Rider: get available (ready) orders + own active deliveries */
  async getRiderAvailableOrders(): Promise<IOrder[]> {
    return this.repo.findByStatus('ready');
  }

  async getRiderActiveOrders(riderId: string): Promise<IOrder[]> {
    return this.repo.findByRider(riderId);
  }

  /** Rider: accept an order (ready → on_the_way) */
  async acceptDelivery(riderId: string, orderId: string): Promise<IOrder> {
    const rider = await this.userRepo.findById(riderId);
    if (!rider) throw new AppError('Rider not found', 404);

    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'ready') throw new AppError('Order is not ready for pickup', 400);

    const updated = await this.repo.assignRider(orderId, riderId, rider.name);
    return updated!;
  }

  /** Rider: advance delivery (on_the_way → delivered) */
  async advanceOrderRider(riderId: string, orderId: string): Promise<IOrder> {
    const order = await this.repo.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (String(order.riderId) !== riderId) throw new AppError('Not your delivery', 403);

    const nextStatus = RIDER_ADVANCE[order.status];
    if (!nextStatus) throw new AppError(`Cannot advance order from "${order.status}"`, 400);

    const updated = await this.repo.updateStatus(orderId, nextStatus);
    return updated!;
  }

  /** Admin: get all orders with optional status filter */
  async getAllOrders(status?: string): Promise<IOrder[]> {
    const filter = status ? { status } : {};
    return this.repo.findAll(filter);
  }
}
