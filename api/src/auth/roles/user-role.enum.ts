export enum UserRole {
  Admin = 'admin',
  Editor = 'editor',
  User = 'user',
}

export const isUserRole = (str: string): str is UserRole =>
  Object.values(UserRole).some((role) => role === str);
