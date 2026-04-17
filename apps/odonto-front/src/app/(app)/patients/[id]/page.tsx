'use client';

import { Calendar, CreditCard, FileText } from 'lucide-react';
import { Banknote } from 'lucide-react';
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
    <div className="space-y-4">
      <PatientCard patient={patient} />

      <div className="w-full">
        <Tabs defaultValue={isSecretary ? 'budgets' : 'anamnesis'} className="w-full">
          <div className="mb-4 flex justify-start overflow-x-auto sm:mb-6">
            <TabsList className="bg-muted/50 border-border/40 h-auto min-w-max gap-1 rounded-xl border p-1">
              {!isSecretary && (
                <TabsTrigger
                  value="anamnesis"
                  className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Anamnese</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="budgets"
                className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
              >
                <Banknote className="h-4 w-4" />
                <span className="hidden sm:inline">Orçamentos</span>
              </TabsTrigger>
              {!isSecretary && (
                <TabsTrigger
                  value="odontogram"
                  className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Odontograma</span>
                </TabsTrigger>
              )}
              {!isSecretary && (
                <TabsTrigger
                  value="exams"
                  className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Exames</span>
                </TabsTrigger>
              )}
              <TabsTrigger
                value="documents"
                className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Receituário</span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="data-[state=active]:text-primary cursor-pointer gap-2 rounded-lg px-2 py-2 text-[0.85rem] font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm sm:px-4"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Financeiro</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {!isSecretary && (
            <TabsContent value="anamnesis">
              <AnamnesisTab patientId={Number(id)} />
            </TabsContent>
          )}

          <TabsContent value="budgets">
            <BudgetsTab patientId={Number(id)} />
          </TabsContent>

          {!isSecretary && (
            <TabsContent value="odontogram">
              <OdontogramTab patientId={Number(id)} />
            </TabsContent>
          )}

          {!isSecretary && (
            <TabsContent value="exams">
              <ExamsTab patientId={Number(id)} />
            </TabsContent>
          )}

          <TabsContent value="documents">
            <DocumentsTab patientId={Number(id)} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab patientId={Number(id)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
