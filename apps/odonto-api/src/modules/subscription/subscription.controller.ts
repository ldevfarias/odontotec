import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  async getStatus(@Req() req, @Tenant() clinicId: number) {
    return this.subscriptionService.getStatus(req.user, clinicId);
  }

  @Post('checkout')
  async createCheckoutSession(
    @Req() req,
    @Tenant() clinicId: number,
    @Body() body: { cancelUrl?: string },
  ) {
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

    return this.subscriptionService.createCheckoutSession(
      req.user,
      clinicId,
      cancelUrl,
    );
  }

  @Post('portal')
  async createPortalSession(@Req() req, @Tenant() clinicId: number) {
    return this.subscriptionService.createPortalSession(req.user, clinicId);
  }
}
