export interface EmailLayoutOptions {
  title: string;
  headerTitle: string;
  headerSubtitle?: string;
  content: string;
  footerNote?: string;
}

export function renderEmailLayout({
  title,
  headerTitle,
  headerSubtitle = 'Sistema de Gestão Odontológica',
  content,
  footerNote,
}: EmailLayoutOptions): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    /* RESET STYLES */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1c1f23;
      background-color: #f4f6f8;
    }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    
    /* LAYOUT */
    .email-wrapper { width: 100%; background-color: #f4f6f8; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    
    /* ACCENT BAR */
    .accent-bar { height: 4px; background-color: #41b883; width: 100%; }
    
    /* HEADER */
    .header { padding: 40px 40px 30px; text-align: left; border-bottom: 1px solid #f0f2f5; }
    .logo-text { color: #1c1f23; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .logo-accent { color: #41b883; } /* Medical Teal */
    .header-subtitle { font-size: 13px; color: #868e96; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
    
    /* CONTENT */
    .content { padding: 40px; }
    .heading { font-size: 24px; font-weight: 700; color: #1c1f23; margin-bottom: 24px; line-height: 1.3; }
    .paragraph { font-size: 15px; color: #495057; margin-bottom: 20px; line-height: 1.7; }
    
    /* COMPONENTS */
    .info-block { background-color: #f8fafc; border-left: 4px solid #41b883; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .info-title { font-size: 14px; font-weight: 700; color: #41b883; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-content { font-size: 15px; color: #1c1f23; font-weight: 500; }
    
    .cta-container { text-align: center; margin: 40px 0; }
    .button { display: inline-block; background-color: #41b883; color: #ffffff !important; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
    .button-secondary { background-color: #ffffff; color: #41b883 !important; border: 2px solid #41b883; }
    .button-destructive { background-color: #ef4444; color: #ffffff !important; }
    
    .divider { height: 1px; background-color: #f0f2f5; margin: 32px 0; }
    
    .expiry-notice { background-color: #fff5f5; border: 1px solid #fee2e2; padding: 16px; border-radius: 8px; margin: 24px 0; }
    .expiry-text { color: #b91c1c; font-size: 14px; margin: 0; font-weight: 500; }
    
    .alternative-link { padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #dee2e6; margin-top: 32px; }
    .link-label { font-size: 12px; color: #868e96; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; }
    .link-url { color: #41b883; word-break: break-all; font-size: 13px; text-decoration: none; }
    
    /* FOOTER */
    .footer { padding: 40px; text-align: center; background-color: #f8fafc; border-top: 1px solid #f0f2f5; }
    .footer-brand { font-size: 14px; font-weight: 700; color: #495057; margin-bottom: 12px; }
    .footer-text { font-size: 12px; color: #868e96; line-height: 1.6; margin-bottom: 8px; }
    .footer-note { font-size: 11px; color: #adb5bd; font-style: italic; margin-top: 16px; }
    
    @media only screen and (max-width: 480px) {
      .header { padding: 30px 20px 20px; }
      .content { padding: 30px 20px; }
      .heading { font-size: 20px; }
      .button { display: block; width: 100%; padding: 14px 20px; margin-left: 0 !important; margin-right: 0 !important; }
      .button + .button { margin-top: 12px; }
      .info-block { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="accent-bar"></div>
      <div class="header">
        <div class="logo-text">Odonto<span class="logo-accent">Eh</span>Tec</div>
        <div class="header-subtitle">${headerSubtitle}</div>
      </div>
      
      <div class="content">
        <h1 class="heading">${headerTitle}</h1>
        ${content}
      </div>

      <div class="footer">
        <div class="footer-brand">OdontoEhTec</div>
        <p class="footer-text">Sistema Inteligente para Gestão Clínica e Consultórios Odontológicos</p>
        <p class="footer-text">© ${currentYear} OdontoEhTec. Todos os direitos reservados.</p>
        ${footerNote ? `<p class="footer-note">${footerNote}</p>` : `<p class="footer-note">Este é um e-mail automático, por favor não responda.</p>`}
      </div>
    </div>
  </div>
</body>
</html>
    `;
}
