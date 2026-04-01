import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClinicsService } from '../../modules/clinics/clinics.service';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';

@Injectable()
export class ClinicMembershipGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private clinicsService: ClinicsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Not yet authenticated — let JwtAuthGuard handle it
        if (!user) {
            return true;
        }

        const rawClinicId = request.headers['x-clinic-id'];

        // Authenticated user accessing a route without a clinic context
        // (e.g., /auth/me, /auth/refresh) — allow through
        // These routes either don't need a clinic or handle it themselves
        if (!rawClinicId) {
            return true;
        }

        const clinicId = Number(rawClinicId);
        if (isNaN(clinicId) || clinicId <= 0) {
            throw new ForbiddenException('Invalid clinic ID');
        }

        const membership = await this.clinicsService.getUserMembership(user.userId, clinicId);
        if (!membership) {
            throw new ForbiddenException('You are not a member of this clinic');
        }

        return true;
    }
}
