/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ProjectService } from './../project.service';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Request,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ProjectUserGuard implements CanActivate {
  constructor(private projectService: ProjectService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

    if (!request) return false;

    const userEmail = request.user?.email;
    if (!userEmail) throw new UnauthorizedException();

    const projectId = request.params?.id || request.body?.projectId;
    if (!projectId)
      throw new BadRequestException({
        message: 'Given project id is not valid',
      });

    return !!(await this.projectService.findOneIfProjectUser(
      projectId,
      userEmail,
    ));
  }
}
