import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { DashboardService, RevenuePeriod } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getClinicId } from '../../common/get-clinic-id';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('stats')
    async getStats(@Request() req) {
        const clinicId = getClinicId(req);
        return this.dashboardService.getStats(clinicId);
    }

    @Get('revenue-history')
    async getRevenueHistory(@Request() req, @Query('period') period?: string) {
        const clinicId = getClinicId(req);
        const validPeriod: RevenuePeriod = (['this_week', 'last_week', 'last_month'] as const).includes(period as RevenuePeriod)
            ? (period as RevenuePeriod)
            : 'this_week';
        return this.dashboardService.getRevenueHistory(clinicId, validPeriod);
    }
}
