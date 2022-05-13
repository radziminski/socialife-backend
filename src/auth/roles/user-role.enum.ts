export enum UserRole {
  Admin = 'admin',
  Organization = 'organization',
  User = 'user',
}

export const isUserRole = (str: string): str is UserRole =>
  Object.values(UserRole).some((role) => role === str);
