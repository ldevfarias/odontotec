import { ClinicForm } from '@/components/settings/clinic-form';

export default function ClinicSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dados da Clínica</h1>
                <p className="text-muted-foreground">
                    Gerencie as informações principais da sua clínica.
                </p>
            </div>
            <ClinicForm />
        </div>
    );
}
