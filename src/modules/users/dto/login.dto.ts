import { UserRole } from '../../../shared/types';

/** Payload accepted by POST /auth/login */
export interface LoginDTO {
  email: string;
  password: string;
  /** Optional role hint — must match the account's registered role */
  role?: UserRole;
}
