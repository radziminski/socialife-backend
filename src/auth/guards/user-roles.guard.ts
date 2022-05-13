import { ROLES_KEY } from './../roles/roles.decorator';
import { UserRole } from './../roles/user-role.enum';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (!user) {
      throw new UnauthorizedException({ message: 'User does not exist' });
    }

    if (!requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException({
        message: "You don't have enough permissions to perform this request.",
      });
    }

    return true;
  }
}
