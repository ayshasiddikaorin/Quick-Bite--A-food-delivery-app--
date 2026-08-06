import { Request, Response } from 'express';
import { RiderService } from './rider.service';
import { sendOk } from '../../shared/utils/response';

export class RiderController {
  constructor(private readonly service: RiderService) {}

  ensureProfile = async (req: Request, res: Response): Promise<void> => {
    const rider = await this.service.ensureProfile(req.user!.id);
    sendOk(res, rider, 'Rider profile ready');
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const rider = await this.service.getProfile(req.user!.id);
    sendOk(res, rider);
  };

  toggleOnline = async (req: Request, res: Response): Promise<void> => {
    const rider = await this.service.toggleOnline(req.user!.id);
    sendOk(res, rider, 'Online status updated');
  };

  getDeliveryHistory = async (req: Request, res: Response): Promise<void> => {
    const history = await this.service.getDeliveryHistory(req.user!.id);
    sendOk(res, history);
  };

  getEarnings = async (req: Request, res: Response): Promise<void> => {
    const earnings = await this.service.getEarnings(req.user!.id);
    sendOk(res, earnings);
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.service.getStats(req.user!.id);
    sendOk(res, stats);
  };

  listAll = async (_req: Request, res: Response): Promise<void> => {
    const riders = await this.service.listAll();
    sendOk(res, riders);
  };
}
