export class DashboardStatsDto {
  patientsToday: number;
  appointments: number;
  occupancyRate: number;
  revenue: number;
  expectedRevenue: number;
  recentAppointments: any[]; // Define a stricter type if possible
  revenueHistory: { day: string; value: number }[];
}
