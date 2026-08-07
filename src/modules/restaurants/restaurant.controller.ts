import { Request, Response } from 'express';
import { RestaurantService } from './restaurant.service';
import { sendOk, sendCreated } from '../../shared/utils/response';

export class RestaurantController {
  constructor(private readonly service: RestaurantService) {}

  listApproved = async (_req: Request, res: Response): Promise<void> => {
    const restaurants = await this.service.listApproved();
    sendOk(res, restaurants);
  };

  listAll = async (_req: Request, res: Response): Promise<void> => {
    const restaurants = await this.service.listAll();
    sendOk(res, restaurants);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.getById(req.params.id);
    sendOk(res, restaurant);
  };

  getMyRestaurant = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.getMyRestaurant(req.user!.id);
    sendOk(res, restaurant);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.create(req.user!.id, req.body);
    sendCreated(res, restaurant, 'Restaurant registered');
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.update(req.user!.id, req.body);
    sendOk(res, restaurant, 'Restaurant updated');
  };

  approve = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.approve(req.params.id);
    sendOk(res, restaurant, 'Restaurant approved');
  };

  toggleOpen = async (req: Request, res: Response): Promise<void> => {
    const restaurant = await this.service.toggleOpen(req.user!.id);
    sendOk(res, restaurant, 'Restaurant status updated');
  };
}
