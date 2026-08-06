import { Request, Response } from 'express';
import { MenuItemService } from './menuItem.service';
import { sendOk, sendCreated } from '../../shared/utils/response';

export class MenuItemController {
  constructor(private readonly service: MenuItemService) {}

  getByRestaurant = async (req: Request, res: Response): Promise<void> => {
    const items = await this.service.getByRestaurant(req.params.restaurantId);
    sendOk(res, items);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.getById(req.params.id);
    sendOk(res, item);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.create(req.user!.id, req.body);
    sendCreated(res, item, 'Menu item added');
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.update(req.user!.id, req.params.id, req.body);
    sendOk(res, item, 'Menu item updated');
  };

  toggleAvailability = async (req: Request, res: Response): Promise<void> => {
    const item = await this.service.toggleAvailability(req.user!.id, req.params.id);
    sendOk(res, item, 'Availability updated');
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.user!.id, req.params.id);
    sendOk(res, null, 'Menu item deleted');
  };
}
