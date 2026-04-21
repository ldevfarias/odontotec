'use client';

import { Banknote, Calendar, CreditCard, FileText } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import { AnamnesisTab } from '@/components/patients/AnamnesisTab';
import { BudgetsTab } from '@/components/patients/BudgetsTab';
import { DocumentsTab } from '@/components/patients/DocumentsTab';
import { ExamsTab } from '@/components/patients/ExamsTab';
import { OdontogramTab } from '@/components/patients/OdontogramTab';
import { PatientCard } from '@/components/patients/PatientCard';
import { PaymentsTab } from '@/components/patients/PaymentsTab';
import { PatientPageSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientsControllerFindOne } from '@/generated/hooks/usePatientsControllerFindOne';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isSecretary = user?.role === 'SIMPLE';

  const { data: patient, isLoading, isError } = usePatientsControllerFindOne(Number(id));
  const tabTriggerClassName =
    'cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:after:bg-primary sm:px-4';

  if (isLoading) {
    return <PatientPageSkeleton />;
  }

  if (isError || !patient) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <div className="text-xl font-semibold">Paciente não encontrado</div>
        <Button onClick={() => router.push('/patients')} variant="outline">
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <PatientCard patient={patient} />

      <div className="flex min-h-0 flex-1">
        <Tabs
          defaultValue={isSecretary ? 'budgets' : 'anamnesis'}
          className="border-border/40 bg-card flex h-full min-h-0 w-full rounded-xl border p-3 shadow-sm sm:p-4"
        >
          <div className="mb-4 flex justify-start overflow-x-auto overflow-y-hidden [scrollbar-width:none] sm:mb-6 [&::-webkit-scrollbar]:hidden">
            <TabsList variant="line">
              {!isSecretary && (
                <TabsTrigger value="anamnesis" className={tabTriggerClassName}>
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Anamnese</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="budgets" className={tabTriggerClassName}>
                <Banknote className="h-4 w-4" />
                <span className="hidden sm:inline">Orçamentos</span>
              </TabsTrigger>
              {!isSecretary && (
                <TabsTrigger value="odontogram" className={tabTriggerClassName}>
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Odontograma</span>
                </TabsTrigger>
              )}
              {!isSecretary && (
                <TabsTrigger value="exams" className={tabTriggerClassName}>
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Exames</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="documents" className={tabTriggerClassName}>
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Receituário</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className={tabTriggerClassName}>
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Financeiro</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {!isSecretary && (
            <TabsContent value="anamnesis" className="min-h-0 flex-1 overflow-y-auto">
              <AnamnesisTab patientId={Number(id)} />
            </TabsContent>
          )}

          <TabsContent value="budgets" className="min-h-0 flex-1 overflow-y-auto">
            <BudgetsTab
              patientId={Number(id)}
              patientName={patient?.name ?? ''}
              patientPhone={patient?.phone ?? undefined}
            />
          </TabsContent>

          {!isSecretary && (
            <TabsContent value="odontogram" className="min-h-0 flex-1 overflow-y-auto">
              <OdontogramTab patientId={Number(id)} />
            </TabsContent>
          )}

          {!isSecretary && (
            <TabsContent value="exams" className="min-h-0 flex-1 overflow-y-auto">
              <ExamsTab patientId={Number(id)} />
            </TabsContent>
          )}

          <TabsContent value="documents" className="min-h-0 flex-1 overflow-y-auto">
            <DocumentsTab patientId={Number(id)} />
          </TabsContent>

          <TabsContent value="payments" className="min-h-0 flex-1 overflow-y-auto">
            <PaymentsTab patientId={Number(id)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
