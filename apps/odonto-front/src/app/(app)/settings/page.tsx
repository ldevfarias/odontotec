'use client';

import { CreditCard, FileText, Settings, Users } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const settingsOptions = [
  {
    title: 'Catálogo de Procedimentos',
    description: 'Gerencie os procedimentos, categorias e valores base para orçamentos.',
    href: '/settings/procedures',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Dados da Clínica',
    description: 'Gerencie as informações principais da sua clínica.',
    href: '/settings/clinic',
    icon: Settings,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Gestão de Equipe',
    description: 'Convide e gerencie as permissões dos profissionais da clínica.',
    href: '/professionals',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Assinatura & Cobrança',
    description: 'Gerencie seu plano, método de pagamento e visualize as faturas.',
    href: '/settings/billing',
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Ajuste as preferências e configurações da sua clínica.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsOptions.map((option) => (
          <Link key={option.href} href={option.href}>
            <Card className="hover:border-primary/50 h-full cursor-pointer transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`rounded-lg p-2 ${option.bgColor}`}>
                  <option.icon className={`h-6 w-6 ${option.color}`} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{option.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
