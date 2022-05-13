import { UserRole } from './roles/user-role.enum';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RequestUser {
  email: string;
  id: number;
  role: UserRole;
}

export type RequestWithUser = Request & {
  user: RequestUser;
};
