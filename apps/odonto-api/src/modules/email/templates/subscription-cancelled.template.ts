import { renderEmailLayout } from './base-layout.template';

export function getSubscriptionCancelledEmailTemplate(
    adminName: string,
    clinicName: string,
    landingUrl: string,
): { subject: string; html: string } {
    const subject = `Assinatura encerrada — sentiremos sua falta`;

    const html = renderEmailLayout({
        title: subject,
        headerTitle: 'Assinatura Encerrada',
        content: `
            <p class="paragraph">Olá, <strong>${adminName}</strong>.</p>

            <p class="paragraph">
                Confirmamos que a assinatura PRO da clínica <strong>${clinicName}</strong>
                foi encerrada. Seu acesso foi revertido para o plano gratuito.
            </p>

            <div class="info-block">
                <div class="info-title">O que acontece agora</div>
                <div class="info-content">
                    <ul style="margin: 8px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 8px;">Seus dados estão preservados</li>
                        <li style="margin-bottom: 8px;">Funcionalidades PRO não estão mais disponíveis</li>
                        <li>Você pode reativar a qualquer momento</li>
                    </ul>
                </div>
            </div>

            <p class="paragraph">
                Caso queira voltar, acesse nosso site e escolha o melhor plano para sua clínica:
            </p>

            <div class="cta-container">
                <a href="${landingUrl}" class="button button-secondary">
                    Ver Planos Disponíveis
                </a>
            </div>

            <p class="paragraph" style="font-size: 13px; color: #868e96;">
                Se você solicitou este cancelamento intencionalmente, nenhuma ação é necessária.
                Agradecemos por ter feito parte da OdontoEhTec.
            </p>
        `,
        footerNote: 'Você recebeu este e-mail porque sua assinatura PRO foi encerrada.',
    });

    return { subject, html };
}
