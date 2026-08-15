import { Request, Response } from 'express';
import { UserService } from './user.service';
import { sendOk, sendCreated } from '../../shared/utils/response';

export class UserController {
  constructor(private readonly service: UserService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.register(req.body);
    sendCreated(res, result, 'Registration successful');
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.login(req.body);
    sendOk(res, result, 'Login successful');
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const user = await this.service.getProfile(req.user!.id);
    sendOk(res, user);
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    // Explicitly extract only allowed fields — prevents role/password injection
    const { name, phone, avatar } = req.body as { name?: string; phone?: string; avatar?: string };
    const user = await this.service.updateProfile(req.user!.id, { name, phone, avatar });
    sendOk(res, user, 'Profile updated');
  };

  listUsers = async (req: Request, res: Response): Promise<void> => {
    const { role } = req.query as { role?: string };
    const users = await this.service.listAll(role);
    sendOk(res, users);
  };

  toggleUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.service.toggleActive(req.params.id);
    sendOk(res, user, 'User status updated');
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    await this.service.deleteUser(req.params.id);
    sendOk(res, null, 'User and all related data deleted');
  };
}
