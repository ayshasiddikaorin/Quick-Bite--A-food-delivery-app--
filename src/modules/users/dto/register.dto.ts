import { UserRole } from '../../../shared/types';

/** Payload accepted by POST /auth/register */
export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  restaurantName?: string;
  vehicleType?: string;
}
