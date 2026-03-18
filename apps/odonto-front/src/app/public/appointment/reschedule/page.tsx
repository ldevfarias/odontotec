'use client';

import { Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AppointmentReschedulePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Calendar className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Reagendamento</CardTitle>
                    <CardDescription>Entre em Contato</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6 text-center">
                    <p className="text-muted-foreground mb-6">
                        Para garantir o melhor horário para você, o reagendamento deve ser feito diretamente com a nossa recepção via telefone ou WhatsApp.
                    </p>
                    <div className="flex items-center gap-2 text-primary font-bold text-xl">
                        <Phone className="h-6 w-6" />
                        (99) 99999-9999
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
