import { renderEmailLayout } from './base-layout.template';

export function getWelcomeEmailTemplate(
  adminName: string,
  clinicName: string,
  dashboardUrl: string,
): { subject: string; html: string } {
  const subject = `Bem-vindo(a) à OdontoEhTec! 🚀`;

  const html = renderEmailLayout({
    title: subject,
    headerTitle: 'Bem-vindo ao Futuro',
    content: `
            <p class="paragraph">Olá, <strong>${adminName}</strong>!</p>
            
            <p class="paragraph">
                Parabéns! A sua clínica <strong>${clinicName}</strong> foi cadastrada com sucesso.
                Estamos empolgados em ajudar você a transformar a gestão do seu consultório.
            </p>

            <div class="info-block">
                <div class="info-title">🚀 Primeiros Passos</div>
                <div class="info-content">
                    <ul style="margin: 8px 0 0 20px; padding: 0;">
                        <li style="margin-bottom: 8px;">Complete o cadastro dos seus dentistas</li>
                        <li style="margin-bottom: 8px;">Configure sua agenda</li>
                        <li>Cadastre seus primeiros pacientes</li>
                    </ul>
                </div>
            </div>

            <div class="cta-container">
                <a href="${dashboardUrl}" class="button">
                    Acessar Meu Painel
                </a>
            </div>

            <p class="paragraph">
                Se precisar de ajuda, nossa equipe de suporte está à disposição para garantir que sua experiência seja impecável.
            </p>
        `,
  });

  return { subject, html };
}
