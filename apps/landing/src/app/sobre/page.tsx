import type { Metadata } from "next";
import { Footer } from "@/components/sections/Footer";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sobre | OdontoEhTec — Software odontológico feito no Brasil",
  description: "Conheça a história por trás do OdontoEhTec. Um software criado por brasileiros para dentistas brasileiros, com suporte em português e preço justo.",
  alternates: { canonical: "https://odontoehtec.com.br/sobre" },
  openGraph: {
    title: "Sobre o OdontoEhTec | Software odontológico feito no Brasil",
    description: "Conheça a história e a missão do OdontoEhTec: tecnologia odontológica transparente, acessível e feita no Brasil.",
    url: "https://odontoehtec.com.br/sobre",
    siteName: "OdontoEhTec",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://odontoehtec.com.br/opengraph-image", width: 1200, height: 630 }],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OdontoEhTec",
  "url": "https://odontoehtec.com.br",
  "foundingLocation": {
    "@type": "Place",
    "addressCountry": "BR",
    "name": "Brasil"
  },
  "description": "Software de gestão odontológica feito no Brasil para dentistas brasileiros.",
  "inLanguage": "pt-BR"
};

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <section className="pt-36 pb-16 bg-background">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-sm font-medium tracking-widest text-primary uppercase">Nossa Missão</span>
          </div>
          <h1 className="heading-hero mb-8 text-balance">
            Por que criamos o <span className="text-primary italic">OdontoEhTec</span>
          </h1>
          <p className="body-large text-muted-foreground text-balance">
            Acreditamos que a tecnologia deve ser invisível, para que você possa focar no paciente, não no software.
          </p>
        </div>
      </section>

      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <div className="space-y-8 body-large text-muted-foreground leading-relaxed">
            <p>
              O OdontoEhTec nasceu da frustração com softwares odontológicos inflados, caros e difíceis de usar. Vimos dentistas pagando por módulos que nunca usavam, sofrendo com interfaces antiquadas e lidando com cobranças por cada usuário adicional da equipe.
            </p>
            <p>
              Decidimos construir algo diferente: um sistema focado no que realmente importa para a rotina clínica. Prontuário acessível durante a consulta. Agenda que funciona sem treinamento. Financeiro que não exige contador. Tudo por um preço único e transparente.
            </p>
            <p>
              Somos um produto feito no Brasil, para dentistas brasileiros. Nosso suporte é em português, nossos preços são em reais, e nosso compromisso é com a simplicidade que libera você para exercer sua profissão com excelência.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl">
          <h2 className="heading-2 mb-12">
            O que nos <span className="text-primary italic">guia</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transparência",
                text: "Um preço. Todas as funcionalidades. Sem taxas escondidas, sem planos confusos, sem letras miúdas."
              },
              {
                title: "Simplicidade",
                text: "Interface que se aprende em minutos. Se você usa um smartphone moderno, usa o OdontoEhTec."
              },
              {
                title: "Foco no dentista",
                text: "Cada funcionalidade existe para resolver um problema real da rotina clínica, não para inflar uma lista de features."
              }
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-3xl border border-border bg-card">
                <div className="w-10 h-1 bg-primary rounded-full mb-4" />
                <h3 className="font-sans font-bold text-xl text-foreground mb-3">{value.title}</h3>
                <p className="body-regular text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-foreground text-background text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-xl">
          <h2 className="font-display text-3xl font-bold mb-4">Faça parte dessa história</h2>
          <p className="text-background/70 mb-8">7 dias grátis para conhecer o OdontoEhTec.</p>
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
