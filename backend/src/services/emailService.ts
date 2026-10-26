import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface SendMailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (config.mail.host && config.mail.user && config.mail.pass && config.mail.from) {
      this.transporter = nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.secure,
        auth: { user: config.mail.user, pass: config.mail.pass },
      });
      logger.info(`Email service initialized via SMTP host: ${config.mail.host}`);
    } else {
      logger.warn("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS/MAIL_FROM). Emails will not be sent.");
    }
  }

  get isConfigured() {
    return this.transporter !== null;
  }

  /**
   * Sends an email. Never throws: mail failures must not break payments or sign-ups.
   */
  async send(params: SendMailParams): Promise<boolean> {
    if (!this.transporter) {
      logger.warn(`Email not sent (SMTP not configured): "${params.subject}" to ${params.to}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: config.mail.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        replyTo: params.replyTo,
      });
      logger.info(`Email sent: "${params.subject}" to ${params.to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email "${params.subject}" to ${params.to}`, error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;
