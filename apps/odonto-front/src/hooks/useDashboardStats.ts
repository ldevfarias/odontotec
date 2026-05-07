import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export interface DashboardTrend {
  value: number;
  isPositive: boolean;
  label: string;
}

export interface DashboardStats {
  patientsToday: number;
  appointments: number;
  occupancyRate: number;
  revenue: number;
  expectedRevenue: number;
  recentAppointments: unknown[];
  revenueHistory: { day: string; value: number }[];
  // Optional trend fields — populated by API when available
  patientsTrend?: DashboardTrend;
  appointmentsTrend?: DashboardTrend;
  revenueTrend?: DashboardTrend;
  occupancyTrend?: DashboardTrend;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/dashboard/stats');
      return response.data;
    },
  });
};
