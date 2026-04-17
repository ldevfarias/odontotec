export class DashboardStatsDto {
  patientsToday: number;
  appointments: number;
  occupancyRate: number;
  revenue: number;
  expectedRevenue: number;
  recentAppointments: unknown[]; // Define a stricter type if possible
  revenueHistory: { day: string; value: number }[];
}
