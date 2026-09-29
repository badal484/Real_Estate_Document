import sgMail from '@sendgrid/mail';
import { logger } from '../utils/logger.js';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

/**
 * Send email using @sendgrid/mail with exponential backoff retry
 * and fallback logging when SENDGRID_API_KEY is missing.
 * Note: Never logs full PII/email body.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env['SENDGRID_API_KEY'];
  const from = process.env['EMAIL_FROM'] || 'alerts@contingencycopilot.com';

  if (!apiKey) {
    logger.warn('[Email] SENDGRID_API_KEY is not configured. Falling back to dev logger mode.', {
      toDomain: payload.to.split('@')[1] || 'unknown',
      subject: payload.subject,
      bodyLength: payload.html.length,
    });
    return {
      success: true,
      providerMessageId: `dev-stub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to: payload.to,
    from,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      logger.info(`[Email] Sending email to recipient domain ...@${payload.to.split('@')[1]} (attempt ${attempt}/${maxAttempts})`);
      const response = await sgMail.send(msg);
      const messageId = response[0]?.headers['x-message-id'] || `sg-${Date.now()}`;
      logger.info(`[Email] Email sent successfully. Message ID: ${messageId}`);
      return {
        success: true,
        providerMessageId: messageId,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.warn(`[Email] Send attempt ${attempt} failed: ${errorMsg}`);
      if (attempt >= maxAttempts) {
        return {
          success: false,
          error: errorMsg,
        };
      }
      // Exponential backoff delay (500ms, 1000ms)
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt - 1)));
    }
  }

  return { success: false, error: 'Maximum retry attempts exceeded' };
}
