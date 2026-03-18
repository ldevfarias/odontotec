import { renderEmailLayout } from './base-layout.template';

export function getSubscriptionProActivatedEmailTemplate(
    adminName: string,
    clinicName: string,
    dashboardUrl: string,
): { subject: string; html: string } {
    const subject = `Sua clínica agora é PRO! Bem-vindo(a) ao plano completo`;

    const html = renderEmailLayout({
        title: subject,
        headerTitle: 'Plano PRO Ativado!',
        content: `
            <p class="paragraph">Olá, <strong>${adminName}</strong>!</p>

            <p class="paragraph">
                Excelente decisão! A clínica <strong>${clinicName}</strong> agora tem acesso
                completo ao plano PRO da OdontoEhTec.
            </p>

            <div class="info-block">
                <div class="info-title">O que você ganhou com o PRO</div>
                <div class="info-content">
                    <ul style="margin: 8px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 8px;">Agendamentos ilimitados</li>
                        <li style="margin-bottom: 8px;">Confirmações automáticas por e-mail</li>
                        <li style="margin-bottom: 8px;">Prontuário eletrônico completo</li>
                        <li style="margin-bottom: 8px;">Relatórios financeiros avançados</li>
                        <li>Suporte prioritário</li>
                    </ul>
                </div>
            </div>

            <div class="cta-container">
                <a href="${dashboardUrl}" class="button">
                    Acessar Meu Painel PRO
                </a>
            </div>

            <p class="paragraph">
                Obrigado por confiar na OdontoEhTec. Estamos aqui para garantir que você
                aproveite ao máximo cada recurso disponível.
            </p>
        `,
        footerNote: 'Você recebeu este e-mail porque ativou o plano PRO na OdontoEhTec.',
    });

    return { subject, html };
}
