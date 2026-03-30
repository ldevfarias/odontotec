const faqs = [
  {
    question: "O OdontoEhTec tem limite de usuários?",
    answer: "Não. O plano Standard inclui usuários e agendas ilimitados sem custo adicional. Adicione toda a sua equipe — recepcionistas, dentistas e assistentes — sem pagar a mais por isso."
  },
  {
    question: "O sistema funciona em celular e tablet?",
    answer: "Sim. O OdontoEhTec é totalmente responsivo e funciona em qualquer dispositivo com navegador: computador, tablet ou smartphone. Não é necessário instalar aplicativo."
  },
  {
    question: "Preciso instalar algum programa no computador?",
    answer: "Não. O OdontoEhTec é 100% na nuvem. Basta acessar pelo navegador. Suas informações ficam sincronizadas em tempo real para toda a equipe."
  },
  {
    question: "Como funciona o período de teste gratuito?",
    answer: "Você tem 7 dias para explorar todas as funcionalidades sem precisar cadastrar cartão de crédito. Ao final do período, escolha assinar ou encerre sem custo algum."
  },
  {
    question: "É seguro armazenar prontuários na nuvem?",
    answer: "Sim. Os dados são criptografados em trânsito e em repouso, armazenados em infraestrutura com alta disponibilidade. O OdontoEhTec segue boas práticas de segurança compatíveis com a LGPD."
  },
  {
    question: "Posso migrar meus dados de outro software odontológico?",
    answer: "Sim. O OdontoEhTec permite importar pacientes via planilha. Nossa equipe de suporte auxilia no processo de migração para garantir que você não perca nenhum dado."
  },
  {
    question: "O suporte é em português?",
    answer: "Sim. O suporte é feito em português via WhatsApp, com prioridade para assinantes. Somos um produto feito no Brasil, para dentistas brasileiros."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-card border-t border-border">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-2 mb-4 text-center">
            Perguntas <span className="text-primary italic">frequentes</span>
          </h2>
          <p className="body-large text-center mb-12">
            Tudo o que você precisa saber antes de começar.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-2xl p-6 bg-background">
                <h3 className="font-sans font-bold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="body-regular text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
