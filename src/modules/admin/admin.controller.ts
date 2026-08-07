import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { sendOk } from '../../shared/utils/response';

export class AdminController {
  constructor(private readonly service: AdminService) {}

  getPlatformStats = async (_req: Request, res: Response): Promise<void> => {
    const stats = await this.service.getPlatformStats();
    sendOk(res, stats);
  };
}
