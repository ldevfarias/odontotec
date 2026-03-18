import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type RevenuePeriod = 'this_week' | 'last_week' | 'last_month';

export interface RevenueDataPoint {
    day: string;
    value: number;
}

export const useRevenueHistory = (period: RevenuePeriod) => {
    return useQuery<RevenueDataPoint[]>({
        queryKey: ['revenue-history', period],
        queryFn: async () => {
            const response = await api.get<RevenueDataPoint[]>('/dashboard/revenue-history', {
                params: { period }
            });
            return response.data;
        }
    });
};
