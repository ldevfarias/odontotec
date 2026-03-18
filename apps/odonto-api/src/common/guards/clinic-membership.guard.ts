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
        const rawClinicId = request.headers['x-clinic-id'];

        // Allow passing if there is no user or no clinic ID requested.
        // Wait, if an endpoint strictly needs a clinic ID, TenantDecorator will enforce its presence.
        if (!user || (!rawClinicId && rawClinicId !== '')) {
            return true;
        }

        const clinicId = Number(rawClinicId);
        if (isNaN(clinicId)) {
            return true; // Let TenantDecorator handle invalid format
        }
        
        const membership = await this.clinicsService.getUserMembership(user.userId, clinicId);
        if (!membership) {
            throw new ForbiddenException('You are not a member of this clinic');
        }

        return true;
    }
}
