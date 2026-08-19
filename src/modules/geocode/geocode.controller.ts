import { Request, Response } from 'express';
import { GeocodeService } from './geocode.service';
import { sendOk } from '../../shared/utils/response';

export class GeocodeController {
  constructor(private readonly service: GeocodeService) {}

  reverse = async (req: Request, res: Response): Promise<void> => {
    const lat = parseFloat(String(req.query.lat));
    const lon = parseFloat(String(req.query.lon));
    const result = await this.service.reverse(lat, lon);
    sendOk(res, result, 'Address resolved');
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const q = String(req.query.q ?? '').trim();
    const results = await this.service.search(q);
    sendOk(res, results, 'Places found');
  };
}