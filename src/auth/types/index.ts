export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RequestUser {
  email: string;
  id: number;
  roles: string[];
}
export type RequestWithUser = Request & {
  user: RequestUser;
};
