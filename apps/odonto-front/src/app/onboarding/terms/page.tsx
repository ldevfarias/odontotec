'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle } from 'lucide-react';
import { notificationService } from '@/services/notification.service';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { acceptTerms } from '@/services/auth';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAcceptTerms = async () => {
        setIsLoading(true);
        try {
            await acceptTerms();
            notificationService.success('Termos aceitos com sucesso!');
            router.push('/onboarding/clinic');
        } catch (error: any) {
            console.error(error);
            notificationService.error(error.response?.data?.message || 'Erro ao aceitar os termos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
            <div className="mb-8 w-full max-w-2xl mt-8">
                <ProgressSteps currentStep={3} />
            </div>

            <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-4 pt-8 pb-4">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Termos de Uso e Privacidade</CardTitle>
                    <CardDescription className="text-base px-6">
                        Para garantir a segurança dos seus dados e dos seus pacientes, precisamos que você leia e concorde com nossos termos antes de prosseguir.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="rounded-md border border-gray-200 bg-white p-1">
                        <ScrollArea className="h-[300px] w-full rounded-md p-6 text-sm text-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo dos Termos</h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900">1. Proteção de Dados (LGPD)</h4>
                                    <p className="mt-1 text-gray-600">
                                        Nós atuamos como "Operadores" dos dados. Você ou sua clínica são os "Controladores". Garantimos a segurança e criptografia das informações dos seus pacientes, mas você é responsável por obter o consentimento deles para o uso da plataforma.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900">2. Prontuários e Retenção</h4>
                                    <p className="mt-1 text-gray-600">
                                        Em conformidade com as regras do CFM/CFO, prontuários de pacientes não são apagados fisicamente, mas anonimizados de forma irreversível caso você solicite a exclusão da sua conta, garantindo o histórico clínico e a conformidade legal.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900">3. Portabilidade e Cancelamento</h4>
                                    <p className="mt-1 text-gray-600">
                                        Se você decidir cancelar sua assinatura, seus dados não serão apagados imediatamente. Fornecemos um período de carência (exportação) para que você possa baixar as informações dos seus pacientes antes que elas sejam efetivamente anonimizadas ou bloqueadas.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900">4. Compromisso de Uso Legal</h4>
                                    <p className="mt-1 text-gray-600">
                                        A plataforma deve ser utilizada estritamente para gestão odontológica e propósitos legais. Tentativas de fraude, invasão ou uso indevido das ferramentas de comunicação podem resultar em suspensão imediata da conta.
                                    </p>
                                </div>
                            </div>

                            <p className="mt-8 text-xs text-gray-500 text-center">
                                Ao clicar em aceitar, você concorda com a versão completa dos <a href="/terms" target="_blank" className="text-primary hover:underline">Termos de Uso</a> e <a href="/privacy" target="_blank" className="text-primary hover:underline">Política de Privacidade</a>.
                            </p>
                        </ScrollArea>
                    </div>
                </CardContent>

                <CardFooter className="pb-8 pt-2 px-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 rounded-b-xl border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/login')}
                        className="text-gray-500 w-full sm:w-auto"
                        disabled={isLoading}
                    >
                        Cancelar Cadastro
                    </Button>

                    <Button
                        onClick={handleAcceptTerms}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white gap-2 font-medium"
                        disabled={isLoading}
                        size="lg"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {isLoading ? 'Registrando aceite...' : 'Li e aceito os Termos'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
