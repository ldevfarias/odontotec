import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Pricing } from "@/components/sections/Pricing";
import { Footer } from "@/components/sections/Footer";
import { APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Planos e Preços | OdontoEhTec — R$ 49,99/mês, tudo incluso",
  description: "Software odontológico completo por R$ 49,99/mês. Equipe ilimitada, sem taxa de setup, cancele quando quiser. Compare com os concorrentes e veja quanto você economiza.",
  alternates: { canonical: "https://odontoehtec.com.br/precos" },
  openGraph: {
    title: "Planos e Preços do OdontoEhTec | R$ 49,99/mês, sem surpresas",
    description: "Um plano único com tudo incluso. Equipe ilimitada, prontuário, agenda e financeiro por R$ 49,99/mês.",
    url: "https://odontoehtec.com.br/precos",
    siteName: "OdontoEhTec",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "https://odontoehtec.com.br/opengraph-image", width: 1200, height: 630 }],
  },
};

const priceSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OdontoEhTec",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "name": "Plano Standard",
    "price": "49.99",
    "priceCurrency": "BRL",
    "description": "Acesso completo ao OdontoEhTec com equipe ilimitada, prontuário, agenda e financeiro.",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2027-12-31",
    "url": "https://odontoehtec.com.br/precos"
  }
};

const priceFaqs = [
  {
    q: "Tem taxa de setup ou implantação?",
    a: "Não. Você cria a conta, convida sua equipe e já começa a usar. Sem custos de implantação, sem treinamentos obrigatórios pagos."
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Não há fidelidade mínima. Cancele quando quiser, direto pelo painel, sem precisar falar com ninguém."
  },
  {
    q: "Quantos usuários estão inclusos no plano?",
    a: "Usuários ilimitados. Adicione toda a sua equipe — dentistas, assistentes e recepcionistas — sem pagar a mais."
  },
  {
    q: "Quais formas de pagamento são aceitas?",
    a: "Cartão de crédito e débito via Stripe. O pagamento é recorrente mensal, processado automaticamente."
  },
  {
    q: "O que acontece ao fim do período de teste?",
    a: "Ao final dos 7 dias, você escolhe assinar ou encerrar. Se não assinar, sua conta é pausada e seus dados ficam preservados por 30 dias."
  }
];

const priceFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": priceFaqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

export default function PrecosPage() {
  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(priceFaqSchema) }}
      />
      <Nav />

      <section className="pt-36 pb-4 bg-background">
        <div className="container mx-auto px-6 md:px-12 max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-1 w-8 bg-primary rounded-full" />
            <span className="text-sm font-medium tracking-widest text-primary uppercase">Preços</span>
          </div>
          <h1 className="heading-hero mb-6 text-balance">
            Quanto custa o OdontoEhTec?{" "}
            <span className="text-primary italic">R$ 49,99/mês</span>, tudo incluso.
          </h1>
          <p className="body-large text-muted-foreground text-balance">
            Um plano único, preço fixo, sem letras miúdas. Toda a equipe inclusa, todas as funcionalidades disponíveis.
          </p>
        </div>
      </section>

      <Pricing />

      <section className="py-16 md:py-24 bg-card border-t border-border">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="heading-2 text-center mb-4">
            Por que o <span className="text-primary italic">OdontoEhTec</span> é diferente?
          </h2>
          <p className="body-large text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Softwares odontológicos tradicionais cobram por usuário e por módulo. Veja como se compara.
          </p>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-4 border-b border-border font-bold text-foreground">Característica</th>
                  <th className="text-center p-4 border-b border-border font-bold text-muted-foreground">Concorrentes típicos</th>
                  <th className="text-center p-4 border-b border-primary/30 bg-primary/5 font-bold text-primary">OdontoEhTec</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Modelo de cobrança", "Por usuário/agenda", "Preço único fixo"],
                  ["Usuários inclusos", "1–3 nos planos base", "Ilimitados"],
                  ["Agendas", "Limitadas por plano", "Ilimitadas"],
                  ["Taxa de setup", "Frequente", "Nenhuma"],
                  ["Período de teste", "Varia / demo guiada", "7 dias autônomo"],
                  ["Suporte em português", "Sim", "Sim, via WhatsApp"],
                  ["Acesso mobile", "App separado / parcial", "100% web responsivo"],
                  ["Contrato mínimo", "Anual em muitos casos", "Mensal, cancele quando quiser"],
                ].map(([feature, competitors, ours], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-card"}>
                    <td className="p-4 border-b border-border text-foreground font-medium">{feature}</td>
                    <td className="p-4 border-b border-border text-center text-muted-foreground">{competitors}</td>
                    <td className="p-4 border-b border-primary/20 bg-primary/5 text-center text-primary font-semibold">{ours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Comparação baseada em planos públicos de softwares odontológicos disponíveis no mercado brasileiro. Dados sujeitos a alteração.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container mx-auto px-6 md:px-12 max-w-2xl">
          <h2 className="heading-2 text-center mb-12">
            Dúvidas sobre <span className="text-primary italic">preços</span>
          </h2>
          <div className="space-y-4">
            {priceFaqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-2xl p-6 bg-card">
                <h3 className="font-sans font-bold text-foreground mb-2">{faq.q}</h3>
                <p className="body-regular text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-foreground text-background text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-xl">
          <h2 className="font-display text-3xl font-bold mb-4">Comece seus 7 dias grátis</h2>
          <p className="text-background/70 mb-8">Sem cartão de crédito. Cancele quando quiser.</p>
          <a
            href={`${APP_URL}/register`}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-10 rounded-full font-sans font-bold text-lg transition-transform hover:-translate-y-1 inline-block"
          >
            Criar conta gratuita
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
