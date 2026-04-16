import { renderEmailLayout } from './base-layout.template';

export const getRegistrationVerificationEmailTemplate = (
  userName: string,
  verificationUrl: string,
) => {
  const subject = `Bem-vindo à OdontoEhTec, ${userName}! 👋`;
  const html = renderEmailLayout({
    title: subject,
    headerTitle: 'Verificação de Conta',
    content: `
            <p class="paragraph">Olá, <strong>${userName}</strong>!</p>
            
            <p class="paragraph">
                Estamos felizes em ter você conosco. Para finalizar a criação da sua conta e definir sua senha, 
                por favor clique no botão abaixo para verificar seu endereço de e-mail:
            </p>

            <div class="cta-container">
                <a href="${verificationUrl}" class="button">
                    Verificar E-mail e Criar Senha
                </a>
            </div>

            <div class="expiry-notice">
                <p class="expiry-text">
                    <strong>⏰ Atenção:</strong> Este link é válido por 24 horas.
                </p>
            </div>

            <div class="divider"></div>

            <p class="paragraph" style="font-size: 13px; color: #868e96;">
                Se você não solicitou este cadastro, pode ignorar este e-mail com segurança.
            </p>
        `,
  });

  return { subject, html };
};
