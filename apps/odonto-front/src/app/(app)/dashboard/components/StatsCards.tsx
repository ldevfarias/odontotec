
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar as CalendarIcon, Activity, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface StatsCardsProps {
    stats: DashboardStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pacientes Hoje</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.patientsToday}</div>
                    <p className="text-xs text-muted-foreground">Agendados para hoje</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ocupação</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                    <p className="text-xs text-muted-foreground">Da capacidade total (20/dia)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">Recebido (Pagamentos)</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.expectedRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">Tratamentos Criados</p>
                </CardContent>
            </Card>
        </div>
    );
};
