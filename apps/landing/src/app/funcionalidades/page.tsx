import type { Metadata } from "next";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/sections/Footer";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Funcionalidades | OdontoEhTec — Prontuário, Agenda e Financeiro",
  description: "Conheça todas as funcionalidades do OdontoEhTec: prontuário digital, agenda inteligente, gestão financeira e equipe ilimitada. Feito para dentistas solos e clínicas.",
  alternates: { canonical: "https://odontoehtec.com.br/funcionalidades" },
  openGraph: {
    title: "Funcionalidades do OdontoEhTec | Prontuário, Agenda e Financeiro",
    description: "Conheça todas as funcionalidades do OdontoEhTec: prontuário digital, agenda inteligente, gestão financeira e equipe ilimitada.",
    url: "https://odontoehtec.com.br/funcionalidades",
    siteName: "OdontoEhTec",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://odontoehtec.com.br/opengraph-image", width: 1200, height: 630 }],
  },
};

const featureSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OdontoEhTec",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://odontoehtec.com.br",
  "featureList": [
    "Prontuário odontológico digital com histórico completo",
    "Agenda inteligente com arrastar e soltar",
    "Lembretes automáticos por email para pacientes",
    "Gestão financeira e orçamentos",
    "Galeria de imagens clínicas (rx, fotos pré/pós)",
    "Receituário e atestados com templates",
    "Equipe e usuários ilimitados",
    "Dashboard com visão do dia",
    "Acesso de qualquer dispositivo"
  ],
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "BRL"
  }
};

export default function FuncionalidadesPage() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featureSchema) }}
      />
      <section className="pt-36 pb-12 bg-background">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-sm font-medium tracking-widest text-primary uppercase">Funcionalidades</span>
          </div>
          <h1 className="heading-hero mb-6 text-balance">
            Tudo que sua <span className="text-primary italic">clínica odontológica</span> precisa em um só lugar
          </h1>
          <p className="body-large text-muted-foreground mb-10 text-balance">
            O OdontoEhTec reúne prontuário digital, agenda inteligente, gestão financeira e comunicação em uma plataforma única. Sem módulos extras, sem custos escondidos.
          </p>
          <a
            href={`${APP_URL}/register`}
            className="fill-button inline-flex items-center justify-center shadow-lg shadow-primary/20"
          >
            Testar grátis por 7 dias
          </a>
        </div>
      </section>

      <Features />

      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="heading-2 text-center mb-16 text-balance">
            Do dentista solo à <span className="text-primary italic">clínica completa</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl border border-border bg-card">
              <span className="text-sm font-bold tracking-widest text-primary uppercase mb-4 block">Dentista Solo</span>
              <h3 className="font-sans font-bold text-2xl text-foreground mb-4">Toda a gestão na palma da mão</h3>
              <p className="body-regular text-muted-foreground mb-6">
                Para o dentista autônomo, o OdontoEhTec elimina papelada e planilhas. Acesse prontuários, agende consultas e controle seu financeiro de qualquer lugar, direto do celular ou computador.
              </p>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Prontuário rápido durante a consulta</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Agenda sem conflitos</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Controle financeiro simples</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Receituário em segundos</li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5">
              <span className="text-sm font-bold tracking-widest text-primary uppercase mb-4 block">Clínica com Equipe</span>
              <h3 className="font-sans font-bold text-2xl text-foreground mb-4">Equipe ilimitada, controle total</h3>
              <p className="body-regular text-muted-foreground mb-6">
                Adicione dentistas, assistentes e recepcionistas sem pagar a mais por isso. Cada profissional tem acesso ao que precisa, com permissões por função. Sua clínica cresce sem que o software te limite.
              </p>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Agendas independentes por dentista</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Usuários e papéis ilimitados</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Visão consolidada da clínica</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Um preço fixo, sem surpresas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-foreground text-background text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-xl">
          <h2 className="font-display text-3xl font-bold mb-4">Pronto para experimentar?</h2>
          <p className="text-background/70 mb-8">7 dias grátis, sem cartão de crédito.</p>
          <a
            href={`${APP_URL}/register`}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-10 rounded-full font-sans font-bold text-lg transition-transform hover:-translate-y-1 inline-block"
          >
            Começar agora
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
