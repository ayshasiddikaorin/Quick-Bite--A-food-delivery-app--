import { Request, Response } from 'express';
import { OfferService } from './offer.service';
import { sendOk, sendCreated } from '../../shared/utils/response';

export class OfferController {
  constructor(private readonly service: OfferService) {}

  getActiveOffers = async (_req: Request, res: Response): Promise<void> => {
    const offers = await this.service.getActiveOffers();
    sendOk(res, offers);
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const offers = await this.service.getAll();
    sendOk(res, offers);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const offer = await this.service.getById(req.params.id);
    sendOk(res, offer);
  };

  getByRestaurant = async (req: Request, res: Response): Promise<void> => {
    const offers = await this.service.getByRestaurant(req.params.restaurantId);
    sendOk(res, offers);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const offer = await this.service.create(req.user!.id, req.body);
    sendCreated(res, offer, 'Offer created');
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const offer = await this.service.update(req.user!.id, req.params.id, req.body);
    sendOk(res, offer, 'Offer updated');
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.user!.id, req.params.id);
    sendOk(res, null, 'Offer deleted');
  };
}
