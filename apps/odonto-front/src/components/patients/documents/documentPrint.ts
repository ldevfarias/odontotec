import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const printPatientDocument = (content: string, title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const safeTitle = escapeHtml(title);
  const safeContent = escapeHtml(content).replace(/\n/g, '<br/>');

  printWindow.document.write(`
    <html>
      <head>
        <title>${safeTitle}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .footer { margin-top: 100px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Documento Clínico</h1>
        </div>
        <h2>${safeTitle}</h2>
        <div>${safeContent}</div>
        <div class="footer">
          <p>Emitido em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};
