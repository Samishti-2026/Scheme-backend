import {
  Injectable, CanActivate, ExecutionContext,
  ForbiddenException, UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { winstonInstance as logger } from '../common/winston.logger';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    if (!requiredRoles) {
      logger.debug(`No @Roles() on handler — open access`, { context: 'RolesGuard' });
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user    = request.user;
    const path    = `${request.method} ${request.path}`;

    logger.debug(`Checking roles for "${path}"`, {
      context:       'RolesGuard',
      requiredRoles,
      user:          user ?? null,
    });

    if (!user) {
      logger.warn(`DENIED — no user on request for ${path}`, { context: 'RolesGuard' });
      throw new UnauthorizedException('Not authenticated');
    }

    if (!requiredRoles.includes(user.role)) {
      logger.warn(`DENIED — role "${user.role}" not in [${requiredRoles.join(', ')}]`, {
        context: 'RolesGuard', path, userId: user.id,
      });
      throw new ForbiddenException(`Role '${user.role}' is not allowed to perform this action`);
    }

    logger.debug(`ALLOWED — role "${user.role}" passed for ${path}`, { context: 'RolesGuard' });
    return true;
  }
}
