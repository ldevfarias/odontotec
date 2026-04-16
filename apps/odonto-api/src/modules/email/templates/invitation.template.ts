import { renderEmailLayout } from './base-layout.template';

export function getInvitationEmailTemplate(
  inviteeName: string,
  clinicName: string,
  registrationUrl: string,
  expiresAt: Date,
): { subject: string; html: string } {
  const expiresInHours = Math.round(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60),
  );

  const subject = `Convite para ${clinicName} - Complete seu cadastro`;

  const html = renderEmailLayout({
    title: subject,
    headerTitle: 'Convite Profissional',
    content: `
            <p class="paragraph">Olá!</p>
            
            <p class="paragraph">
                Você foi convidado(a) para fazer parte da equipe de profissionais da clínica. 
                Estamos muito felizes em tê-lo(a) conosco!
            </p>

            <div class="info-block">
                <div class="info-title">Clínica</div>
                <div class="info-content">${clinicName}</div>
            </div>

            <p class="paragraph">
                Para começar a usar o sistema, você precisa completar seu cadastro criando uma senha 
                e fornecendo algumas informações básicas.
            </p>

            <div class="cta-container">
                <a href="${registrationUrl}" class="button">
                    Completar Cadastro
                </a>
            </div>

            <div class="expiry-notice">
                <p class="expiry-text">
                    <strong>⏰ Atenção:</strong> Este convite é válido por ${expiresInHours} horas. 
                    Após este período, será necessário solicitar um novo convite.
                </p>
            </div>

            <div class="divider"></div>

            <div class="alternative-link">
                <div class="link-label">Não consegue clicar no botão?</div>
                <div class="paragraph" style="font-size: 13px; margin-bottom: 8px;">
                    Copie e cole o seguinte link no seu navegador:
                </div>
                <a href="${registrationUrl}" class="link-url">${registrationUrl}</a>
            </div>

            <p class="paragraph" style="margin-top: 32px; font-size: 13px; color: #868e96;">
                Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
            </p>
        `,
  });

  return { subject, html };
}
