import { Controller, Get, Post, Req, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getClinicId } from '../../common/get-clinic-id';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) { }

    @Get('status')
    async getStatus(@Req() req: any) {
        return this.subscriptionService.getStatus(req.user, getClinicId(req));
    }

    @Post('checkout')
    async createCheckoutSession(@Req() req: any, @Body() body: { cancelUrl?: string }) {
        const { cancelUrl } = body ?? {};

        // Only allow absolute URLs from known origins to prevent open-redirect abuse.
        if (cancelUrl !== undefined) {
            let parsed: URL;
            try {
                parsed = new URL(cancelUrl);
            } catch {
                throw new BadRequestException('cancelUrl must be a valid absolute URL');
            }
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new BadRequestException('cancelUrl must use http or https');
            }
        }

        return this.subscriptionService.createCheckoutSession(req.user, getClinicId(req), cancelUrl);
    }

    @Post('portal')
    async createPortalSession(@Req() req: any) {
        return this.subscriptionService.createPortalSession(req.user, getClinicId(req));
    }
}
