import { Request, Response } from 'express';
import { OrderService } from './order.service';
import { sendOk, sendCreated } from '../../shared/utils/response';

export class OrderController {
  constructor(private readonly service: OrderService) {}

  placeOrder = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.placeOrder(req.user!.id, req.body);
    sendCreated(res, order, 'Order placed successfully');
  };

  getMyOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await this.service.getMyOrders(req.user!.id);
    sendOk(res, orders);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.getById(req.params.id);
    sendOk(res, order);
  };

  getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await this.service.getRestaurantOrders(req.user!.id);
    sendOk(res, orders);
  };

  advanceOrderSeller = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.advanceOrderSeller(req.user!.id, req.params.id);
    sendOk(res, order, 'Order status updated');
  };

  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.cancelOrder(req.user!.id, req.params.id);
    sendOk(res, order, 'Order cancelled');
  };

  getRiderAvailableOrders = async (_req: Request, res: Response): Promise<void> => {
    const orders = await this.service.getRiderAvailableOrders();
    sendOk(res, orders);
  };

  getRiderActiveOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await this.service.getRiderActiveOrders(req.user!.id);
    sendOk(res, orders);
  };

  acceptDelivery = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.acceptDelivery(req.user!.id, req.params.id);
    sendOk(res, order, 'Delivery accepted');
  };

  advanceOrderRider = async (req: Request, res: Response): Promise<void> => {
    const order = await this.service.advanceOrderRider(req.user!.id, req.params.id);
    sendOk(res, order, 'Order status updated');
  };

  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query as { status?: string };
    const orders = await this.service.getAllOrders(status);
    sendOk(res, orders);
  };

  getSellerStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.service.getSellerStats(req.user!.id);
    sendOk(res, stats);
  };
}
