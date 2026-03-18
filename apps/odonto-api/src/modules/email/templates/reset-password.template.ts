import { renderEmailLayout } from './base-layout.template';

export function getResetPasswordEmailTemplate(
    userName: string,
    resetUrl: string,
    expiresInParams: string = '1 hora',
): { subject: string; html: string } {
    const subject = `Redefinição de Senha - OdontoEhTec 🔒`;

    const html = renderEmailLayout({
        title: subject,
        headerTitle: 'Segurança da Conta',
        content: `
            <p class="paragraph">Olá, <strong>${userName}</strong>!</p>
            
            <p class="paragraph">
                Recebemos uma solicitação para redefinir a senha da sua conta.
                Se você não fez essa solicitação, pode ignorar este e-mail com segurança.
            </p>

            <div class="cta-container">
                <a href="${resetUrl}" class="button">
                    Redefinir Minha Senha
                </a>
            </div>

            <div class="expiry-notice">
                <p class="expiry-text">
                    <strong>⚠️ Importante:</strong> Este link é válido apenas por <strong>${expiresInParams}</strong>.
                </p>
            </div>

            <div class="divider"></div>

            <div class="alternative-link">
                <div class="link-label">Link de Fallback</div>
                <div class="paragraph" style="font-size: 13px; margin-bottom: 8px;">
                    Se o botão não funcionar, copie este endereço:
                </div>
                <a href="${resetUrl}" class="link-url">${resetUrl}</a>
            </div>
        `,
        footerNote: 'Este é um e-mail de segurança de OdontoEhTec. Ocultamos detalhes para sua proteção.',
    });

    return { subject, html };
}

