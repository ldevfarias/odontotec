import { Injectable } from '@nestjs/common';
import { AppointmentsService } from '../appointments/appointments.service';
import { PaymentsService } from '../patients/services/payments.service';
import { TreatmentPlansService } from '../treatment-plans/treatment-plans.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

export type RevenuePeriod = 'this_week' | 'last_week' | 'last_month';

@Injectable()
export class DashboardService {
    constructor(
        private appointmentsService: AppointmentsService,
        private paymentsService: PaymentsService,
        private treatmentPlansService: TreatmentPlansService,
    ) { }

    async getStats(clinicId: number): Promise<DashboardStatsDto> {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        // 1. Appointments Today
        const appointmentsToday = await this.appointmentsService.findAll(clinicId, undefined, undefined, {
            date: startOfDay.toISOString().split('T')[0]
        });

        const patientsToday = appointmentsToday.length;

        // 2. Occupancy Rate
        const capacity = 20;
        const occupancyRate = Math.min(Math.round((patientsToday / capacity) * 100), 100);

        // 3. Realized Revenue (Today)
        const payments = await this.paymentsService.findByPeriod(startOfDay, endOfDay, clinicId);
        const revenue = payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        // 4. Expected Revenue
        const treatmentPlans = await this.treatmentPlansService.findByPeriod(startOfDay, endOfDay, clinicId);
        const expectedRevenue = treatmentPlans
            .reduce((sum, plan) => sum + Number(plan.totalAmount), 0);

        // 5. Revenue History (default: this_week)
        const revenueHistory = await this.getRevenueHistory(clinicId, 'this_week');

        return {
            patientsToday,
            appointments: patientsToday,
            occupancyRate,
            revenue,
            expectedRevenue,
            recentAppointments: appointmentsToday.slice(0, 5),
            revenueHistory
        };
    }

    async getRevenueHistory(clinicId: number, period: RevenuePeriod): Promise<{ day: string; value: number }[]> {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        let startDate: Date;
        let numDays: number;

        if (period === 'last_month') {
            startDate = new Date(todayStart);
            startDate.setDate(startDate.getDate() - 29);
            numDays = 30;
        } else if (period === 'last_week') {
            const dayOfWeek = todayStart.getDay();
            const mondayThisWeek = new Date(todayStart);
            mondayThisWeek.setDate(todayStart.getDate() - ((dayOfWeek + 6) % 7));
            startDate = new Date(mondayThisWeek);
            startDate.setDate(mondayThisWeek.getDate() - 7);
            numDays = 7;
        } else {
            // this_week: Mon → today
            const dayOfWeek = todayStart.getDay();
            startDate = new Date(todayStart);
            startDate.setDate(todayStart.getDate() - ((dayOfWeek + 6) % 7));
            numDays = 7;
        }

        const rangeEnd = period === 'last_week'
            ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
            : endOfDay;

        const allPayments = await this.paymentsService.findByPeriod(startDate, rangeEnd, clinicId);

        const result: { day: string; value: number }[] = [];
        for (let i = 0; i < numDays; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);

            const dayPayments = allPayments.filter(p => {
                const pd = new Date(p.date);
                return pd.getFullYear() === d.getFullYear() &&
                    pd.getMonth() === d.getMonth() &&
                    pd.getDate() === d.getDate() &&
                    p.status === 'COMPLETED';
            });

            const value = dayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
            const label = period === 'last_month'
                ? d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                : dayName.charAt(0).toUpperCase() + dayName.slice(1);

            result.push({ day: label, value });
        }

        return result;
    }
}
