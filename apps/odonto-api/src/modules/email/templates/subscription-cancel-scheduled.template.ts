import { renderEmailLayout } from './base-layout.template';

export function getSubscriptionCancelScheduledEmailTemplate(
  adminName: string,
  clinicName: string,
  landingUrl: string,
  periodEnd: Date,
): { subject: string; html: string } {
  const formattedDate = periodEnd.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });

  const subject = `Cancelamento agendado para ${formattedDate} — ${clinicName}`;

  const html = renderEmailLayout({
    title: subject,
    headerTitle: 'Cancelamento Agendado',
    content: `
            <p class="paragraph">Olá, <strong>${adminName}</strong>.</p>

            <p class="paragraph">
                Recebemos sua solicitação de cancelamento. O plano PRO da clínica
                <strong>${clinicName}</strong> continuará ativo até o final do período pago.
            </p>

            <div class="info-block">
                <div class="info-title">Data de encerramento do acesso PRO</div>
                <div class="info-content">${formattedDate}</div>
            </div>

            <p class="paragraph">
                Até essa data, você mantém acesso completo a todos os recursos PRO.
                Após o encerramento, a clínica migrará automaticamente para o plano gratuito.
            </p>

            <p class="paragraph">Mudou de ideia? Você pode reativar antes dessa data:</p>

            <div class="cta-container">
                <a href="${landingUrl}" class="button button-secondary">
                    Reativar Assinatura
                </a>
            </div>
        `,
    footerNote:
      'Você recebeu este e-mail porque um cancelamento foi agendado para sua conta.',
  });

  return { subject, html };
}
