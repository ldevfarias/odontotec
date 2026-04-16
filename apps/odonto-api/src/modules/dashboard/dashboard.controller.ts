import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService, RevenuePeriod } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Tenant() clinicId: number) {
    return this.dashboardService.getStats(clinicId);
  }

  @Get('revenue-history')
  async getRevenueHistory(
    @Tenant() clinicId: number,
    @Query('period') period?: string,
  ) {
    const validPeriod: RevenuePeriod = (
      ['this_week', 'last_week', 'last_month'] as const
    ).includes(period as RevenuePeriod)
      ? (period as RevenuePeriod)
      : 'this_week';
    return this.dashboardService.getRevenueHistory(clinicId, validPeriod);
  }
}
