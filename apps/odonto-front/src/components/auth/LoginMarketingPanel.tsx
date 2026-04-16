import { CheckCircle2, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/ui/logo';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3002';

export function LoginMarketingPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[#41b883] p-12 text-white lg:flex lg:w-1/2">
      <div className="pointer-events-none absolute top-0 right-0 h-[80vw] w-[80vw] translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[60vw] w-[60vw] -translate-x-1/3 translate-y-1/3 rounded-full bg-black/5 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <Link href={LANDING_PAGE_URL} className="mb-16 inline-block">
          <Logo className="text-3xl text-gray-900" ehColor="text-white" />
        </Link>

        <div className="mt-auto mb-auto max-w-lg space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl leading-[1.1] font-bold tracking-tight xl:text-5xl">
              Sua clinica, no ritmo <br className="hidden xl:block" /> do que voce precisa.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-[#e2f5ec]">
              Otimize seu tempo clinico e organize seu negocio. Zero distracoes, maxima eficiencia.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
              <div className="shrink-0 rounded-xl bg-white/20 p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                  Equipe ilimitada
                  <CheckCircle2 className="h-4 w-4 text-[#e2f5ec]" />
                </h3>
                <p className="text-sm leading-relaxed text-[#e2f5ec]/90">
                  Cadastre quantos usuarios precisar. Sem pegadinhas e sem custos por assento.
                  Cresca sem barreiras.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
              <div className="shrink-0 rounded-xl bg-white/20 p-3">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                  Gestao visual
                  <CheckCircle2 className="h-4 w-4 text-[#e2f5ec]" />
                </h3>
                <p className="text-sm leading-relaxed text-[#e2f5ec]/90">
                  Dashboard objetivo que mostra exatamente o que precisa de atencao hoje, em tempo
                  real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
