'use client';

import { useParams, useRouter } from 'next/navigation';
import {
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    FileText,
    CreditCard,
    Plus,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { PatientPageSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { usePatientsControllerFindOne } from '@/generated/hooks/usePatientsControllerFindOne';
import { AnamnesisTab } from '@/components/patients/AnamnesisTab';
import { ExamsTab } from '@/components/patients/ExamsTab';
import { OdontogramTab } from '@/components/patients/OdontogramTab';
import { BudgetsTab } from '@/components/patients/BudgetsTab';
import { TreatmentPlansTab } from '@/components/patients/TreatmentPlansTab';
import { PaymentsTab } from '@/components/patients/PaymentsTab';
import { DocumentsTab } from '@/components/patients/DocumentsTab';
import { Banknote } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PatientCard } from '@/components/patients/PatientCard';

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
            <PatientCard
                patient={patient}
            />

            <div className="w-full">
                <Tabs defaultValue={isSecretary ? "budgets" : "anamnesis"} className="w-full">
                    <div className="flex justify-start mb-4 sm:mb-6 overflow-x-auto">
                        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto gap-1 border border-border/40 min-w-max">
                            {!isSecretary && (
                                <TabsTrigger
                                    value="anamnesis"
                                    className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Anamnese</span>
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="budgets"
                                className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
                            >
                                <Banknote className="h-4 w-4" />
                                <span className="hidden sm:inline">Orçamentos</span>
                            </TabsTrigger>
                            {!isSecretary && (
                                <TabsTrigger
                                    value="odontogram"
                                    className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span className="hidden sm:inline">Odontograma</span>
                                </TabsTrigger>
                            )}
                            {!isSecretary && (
                                <TabsTrigger
                                    value="exams"
                                    className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Exames</span>
                                </TabsTrigger>
                            )}
                            <TabsTrigger
                                value="documents"
                                className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
                            >
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Receituário</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="payments"
                                className="px-2 sm:px-4 py-2 rounded-lg cursor-pointer data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-200 gap-2 font-semibold text-[0.85rem]"
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
