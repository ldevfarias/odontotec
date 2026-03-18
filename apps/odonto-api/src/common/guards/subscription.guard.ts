import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from '../../modules/subscription/subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, url } = request;

        // Bypass checks if no user (should be handled by AuthGuard) or 
        // if user is accessing subscription endpoints (to allow them to pay/subscribe)
        // or auth endpoints (login/register)
        if (!user || url.startsWith('/auth') || url.startsWith('/subscription')) {
            return true;
        }

        const clinicIdRaw = request.headers['x-clinic-id'];
        const clinicId = Number(clinicIdRaw);

        // Skip if no clinic context (e.g. user hasn't selected a clinic yet)
        if (!clinicIdRaw || isNaN(clinicId)) {
            return true;
        }

        const status = await this.subscriptionService.getStatus(user, clinicId);

        if (status.isExpired) {
            throw new HttpException({
                statusCode: 402,
                message: 'Subscription expired. Please upgrade your plan.',
                error: 'Payment Required',
                daysRemaining: status.daysRemaining
            }, HttpStatus.PAYMENT_REQUIRED);
        }

        if (status.status === 'CANCELED') {
            const hasGracePeriod = status.currentPeriodEnd && new Date(status.currentPeriodEnd) > new Date();
            if (!hasGracePeriod) {
                throw new HttpException({
                    statusCode: 403,
                    message: 'Subscription canceled or unpaid.',
                    error: 'Access Denied'
                }, HttpStatus.FORBIDDEN);
            }
            // Grace period: subscription was canceled but paid period still active — allow access
        }

        return true;
    }
}
