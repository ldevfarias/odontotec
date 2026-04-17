import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';

export interface DashboardStats {
  patientsToday: number;
  appointments: number;
  occupancyRate: number;
  revenue: number;
  expectedRevenue: number;
  recentAppointments: unknown[];
  revenueHistory: { day: string; value: number }[];
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
