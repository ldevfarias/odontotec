import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getInvitationEmailTemplate } from './templates/invitation.template';
import { getAppointmentEmailTemplate } from './templates/appointment-confirmation.template';
import { getWelcomeEmailTemplate } from './templates/welcome.template';
import { getResetPasswordEmailTemplate } from './templates/reset-password.template';
import { getRegistrationVerificationEmailTemplate } from './templates/registration-verification.template';
import { getSubscriptionProActivatedEmailTemplate } from './templates/subscription-pro-activated.template';
import { getSubscriptionCancelScheduledEmailTemplate } from './templates/subscription-cancel-scheduled.template';
import { getSubscriptionCancelledEmailTemplate } from './templates/subscription-cancelled.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;
  private landingUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured. Email sending will be disabled.',
      );
    }

    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'onboarding@resend.dev';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    this.landingUrl =
      this.configService.get<string>('LANDING_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3001';
  }

  async sendInvitationEmail(
    toEmail: string,
    clinicName: string,
    token: string,
    expiresAt: Date,
  ): Promise<boolean> {
    try {
      if (!this.resend) {
        this.logger.warn(
          'Resend not initialized. Skipping email send to ' + toEmail,
        );
        return false;
      }

      const registrationUrl = `${this.frontendUrl}/register/${token}`;
      const { subject, html } = getInvitationEmailTemplate(
        toEmail,
        clinicName,
        registrationUrl,
        expiresAt,
      );

      this.logger.log(`Sending invitation email to ${toEmail}`);

      const { data, error } = await this.resend.emails.send({
        from: `${clinicName} <${this.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: html,
      });

      if (error) {
        this.logger.error(
          `Failed to send invitation email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`Successfully sent invitation email to ${toEmail}`, {
        emailId: data?.id,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error sending invitation email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendAppointmentConfirmation(
    toEmail: string,
    patientName: string,
    clinicName: string,
    appointmentDate: string,
    dentistName: string,
    appointmentId: number,
    token: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const cancelUrl = `${this.frontendUrl}/public/appointment/cancel?token=${token}&id=${appointmentId}`;
      const rescheduleUrl = `${this.frontendUrl}/public/appointment/reschedule?token=${token}&id=${appointmentId}`;

      const { subject, html } = getAppointmentEmailTemplate(
        patientName,
        clinicName,
        appointmentDate,
        dentistName,
        cancelUrl,
        rescheduleUrl,
      );

      const { error } = await this.resend.emails.send({
        from: `${clinicName} <${this.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: html,
      });

      if (error) {
        this.logger.error(
          `Failed to send appointment email to ${toEmail}:`,
          error,
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error sending appointment email to ${toEmail}:`,
        error,
      );
      return false;
    }
  }

  async sendWelcomeEmail(
    toEmail: string,
    adminName: string,
    clinicName: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const { subject, html } = getWelcomeEmailTemplate(
        adminName,
        clinicName,
        `${this.frontendUrl}/dashboard`,
      );

      const { error } = await this.resend.emails.send({
        from: `${clinicName} <${this.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: html,
      });

      if (error) {
        this.logger.error(`Failed to send welcome email to ${toEmail}:`, error);
        return false;
      }

      this.logger.log(`Welcome email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${toEmail}:`, error);
      return false;
    }
  }

  async sendRegistrationVerificationEmail(
    toEmail: string,
    userName: string,
    token: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const verificationUrl = `${this.frontendUrl}/register/verify/${token}`;
      const { subject, html } = getRegistrationVerificationEmailTemplate(
        userName,
        verificationUrl,
      );

      const { error } = await this.resend.emails.send({
        from: `OdontoTec <${this.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: html,
      });

      if (error) {
        this.logger.error(
          `Failed to send registration verification email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`Registration verification email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending registration verification email to ${toEmail}:`,
        error,
      );
      return false;
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    userName: string,
    token: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
      const { subject, html } = getResetPasswordEmailTemplate(
        userName,
        resetUrl,
      );

      const { error } = await this.resend.emails.send({
        from: `OdontoTec Security <${this.fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: html,
      });

      if (error) {
        this.logger.error(
          `Failed to send password reset email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`Password reset email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password reset email to ${toEmail}:`,
        error,
      );
      return false;
    }
  }

  async sendSubscriptionProActivatedEmail(
    toEmail: string,
    adminName: string,
    clinicName: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const { subject, html } = getSubscriptionProActivatedEmailTemplate(
        adminName,
        clinicName,
        `${this.frontendUrl}/dashboard`,
      );

      const { error } = await this.resend.emails.send({
        from: `OdontoEhTec <${this.fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send PRO activated email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`PRO activated email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending PRO activated email to ${toEmail}:`,
        error,
      );
      return false;
    }
  }

  async sendSubscriptionCancelScheduledEmail(
    toEmail: string,
    adminName: string,
    clinicName: string,
    periodEnd: Date,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const { subject, html } = getSubscriptionCancelScheduledEmailTemplate(
        adminName,
        clinicName,
        this.landingUrl,
        periodEnd,
      );

      const { error } = await this.resend.emails.send({
        from: `OdontoEhTec <${this.fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send cancel scheduled email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`Cancel scheduled email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending cancel scheduled email to ${toEmail}:`,
        error,
      );
      return false;
    }
  }

  async sendSubscriptionCancelledEmail(
    toEmail: string,
    adminName: string,
    clinicName: string,
  ): Promise<boolean> {
    try {
      if (!this.resend) return false;

      const { subject, html } = getSubscriptionCancelledEmailTemplate(
        adminName,
        clinicName,
        this.landingUrl,
      );

      const { error } = await this.resend.emails.send({
        from: `OdontoEhTec <${this.fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send cancelled email to ${toEmail}:`,
          error,
        );
        return false;
      }

      this.logger.log(`Subscription cancelled email sent to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending cancelled email to ${toEmail}:`, error);
      return false;
    }
  }
}
