import { Skeleton } from '@/components/ui/skeleton';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { cn } from '@/lib/utils';

export function TopTreatments() {
  const { data: proceduresResponse, isLoading } = useClinicProceduresControllerFindAll();

  // Mocks para visualização conforme o print
  const mockProcedures = [
    { id: '1', name: 'Limpeza Dental' },
    { id: '2', name: 'Canal' },
    { id: '3', name: 'Clareamento' },
    { id: '4', name: 'Extração' },
    { id: '5', name: 'Aparelho' },
  ];

  const procedures: { id?: string | number; name?: string }[] = proceduresResponse?.data?.length
    ? proceduresResponse.data
    : mockProcedures;

  // Map index to a specific icon and color scheme to maintain the UI design
  const getTreatmentStyle = (name: string) => {
    const text = name.toLowerCase();

    if (text.includes('limpeza')) return 'bg-emerald-500';
    if (text.includes('canal')) return 'bg-blue-500';
    if (text.includes('clareamento')) return 'bg-orange-500';
    if (text.includes('extração') || text.includes('extrac')) return 'bg-rose-500';
    if (text.includes('aparelho')) return 'bg-violet-500';

    return 'bg-gray-300';
  };

  const displayedTreatments = procedures.slice(0, 5);

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-[17px] font-bold tracking-tight text-gray-900">Top Tratamentos</h3>

      <div className="flex flex-1 flex-col gap-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))
        ) : displayedTreatments.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            Nenhum procedimento cadastrado.
          </div>
        ) : (
          displayedTreatments.map((treatment, i: number) => {
            const colorClass = getTreatmentStyle(treatment.name || '');
            // Using a dummy percentage for visual matching with the print,
            // but in a real app this would come from the stats
            const percentage = [85, 60, 45, 35, 25][i] || 20;
            const count = [42, 28, 21, 17, 12][i] || 0;

            return (
              <div key={treatment.id || i} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="font-semibold text-gray-700">{treatment.name}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-50">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', colorClass)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
