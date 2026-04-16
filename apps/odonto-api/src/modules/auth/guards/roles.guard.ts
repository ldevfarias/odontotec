import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access (or keep it false for maximum security)
    // According to the plan, if no @Roles() is present, we should return false.
    if (!requiredRoles) {
      return false;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      console.error('[RolesGuard] No user found in request');
      return false;
    }

    // Compare roles using case-insensitive if needed, but here they should be exact matches
    const hasRole = requiredRoles.some(
      (role) => String(user.role).toUpperCase() === String(role).toUpperCase(),
    );

    if (!hasRole) {
      console.warn(
        `[RolesGuard] User ${user.userId} with role ${user.role} does not have one of required roles: ${requiredRoles}`,
      );
    }

    return hasRole;
  }
}
