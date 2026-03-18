import { renderEmailLayout } from './base-layout.template';

export const getAppointmentEmailTemplate = (
    patientName: string,
    clinicName: string,
    appointmentDate: string,
    dentistName: string,
    cancelUrl: string,
    rescheduleUrl: string,
) => {
    const subject = `Agendamento Confirmado - ${clinicName}`;
    const html = renderEmailLayout({
        title: subject,
        headerTitle: 'Consulta Agendada',
        headerSubtitle: clinicName,
        content: `
            <p class="paragraph">Olá, <strong>${patientName}</strong>!</p>
            <p class="paragraph">Seu agendamento foi realizado com sucesso. Confira os detalhes abaixo:</p>
            
            <div class="info-block">
                <div class="info-title">Data e Hora</div>
                <div class="info-content">${appointmentDate}</div>
                <div class="info-title" style="margin-top: 12px;">Profissional</div>
                <div class="info-content">${dentistName}</div>
            </div>

            <p class="paragraph">Caso precise alterar ou cancelar sua consulta, utilize os botões abaixo:</p>
            
            <div class="cta-container">
                <a href="${rescheduleUrl}" class="button">Reagendar</a>
                <a href="${cancelUrl}" class="button button-destructive">Cancelar</a>
            </div>

            <div class="divider"></div>
            
            <p class="paragraph" style="font-size: 13px; color: #868e96;">
                Por favor, tente chegar com 10 minutos de antecedência.
            </p>
        `,
        footerNote: `Este é um e-mail automático de ${clinicName}. Por favor, não responda.`,
    });
    return { subject, html };
};

