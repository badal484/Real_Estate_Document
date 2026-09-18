/**
 * Alert Service — STUB
 *
 * Will send deadline reminders via:
 *   - Twilio SMS
 *   - SendGrid / AWS SES email
 *   - node-cron or BullMQ scheduling
 *
 * v1: stub only — logs the would-be alert but makes no real API calls.
 */

import { logger } from '../utils/logger.js';

export interface AlertPayload {
  to: string;            // phone number (SMS) or email address
  dealId: string;
  deadlineLabel: string;
  deadlineDate: Date;
  daysUntilDeadline: number;
}

export async function sendSmsAlert(payload: AlertPayload): Promise<void> {
  logger.info(`[Alert stub] Would SMS ${payload.to}: "${payload.deadlineLabel}" due ${payload.deadlineDate.toDateString()}`);
  // TODO: implement with Twilio SDK
}

export async function sendEmailAlert(payload: AlertPayload): Promise<void> {
  logger.info(`[Alert stub] Would email ${payload.to}: "${payload.deadlineLabel}" due ${payload.deadlineDate.toDateString()}`);
  // TODO: implement with SendGrid / AWS SES
}

export async function scheduleAlerts(_dealId: string): Promise<void> {
  logger.info('[Alert stub] Alert scheduling not yet implemented (node-cron / BullMQ)');
  // TODO: schedule T-3 day, T-1 day, day-of alerts
}
