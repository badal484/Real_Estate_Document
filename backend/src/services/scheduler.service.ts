import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { sendEmailAlert } from './alert.service.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

let cronTask: cron.ScheduledTask | null = null;

/**
 * Reset pending email window logs when a deadline is edited
 * so that new alerts will fire correctly for the modified date.
 */
export async function resetDeadlineAlertWindows(deadlineId: string): Promise<void> {
  try {
    await prisma.emailLog.deleteMany({
      where: { deadlineId },
    });
    logger.info(`[Scheduler] Reset email window logs for edited deadline ${deadlineId}`);
  } catch (err: unknown) {
    logger.warn(`[Scheduler] Failed to reset email logs for deadline ${deadlineId}: ${String(err)}`);
  }
}

/**
 * Main cron process loop. Processes all active deals & confirmed deadlines.
 */
export async function runDeadlineSchedulerTick(): Promise<{ processed: number; sent: number }> {
  // Acquire Postgres advisory lock to ensure single execution across multiple app instances
  let lockAcquired = false;
  try {
    const lockResult = await prisma.$queryRaw<Array<{ pg_try_advisory_xact_lock: boolean }>>`
      SELECT pg_try_advisory_xact_lock(482910482)
    `;
    lockAcquired = lockResult[0]?.pg_try_advisory_xact_lock ?? true;
  } catch {
    lockAcquired = true; // Fallback if DB doesn't support advisory lock in transaction
  }

  if (!lockAcquired) {
    logger.info('[Scheduler] Another instance holds the scheduler advisory lock. Skipping tick.');
    return { processed: 0, sent: 0 };
  }

  const activeDeals = await prisma.deal.findMany({
    where: { status: 'ACTIVE' },
    include: {
      notificationSettings: true,
      deadlines: {
        where: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
        },
        include: { clause: true },
      },
    },
  });

  let processedCount = 0;
  let sentCount = 0;
  const now = new Date();

  for (const deal of activeDeals) {
    const settings = deal.notificationSettings;
    const isEnabled = settings ? settings.enabled : true;
    if (!isEnabled) continue;

    const recipients = settings?.recipients.length
      ? settings.recipients
      : [process.env['DEFAULT_ALERT_RECIPIENT'] || 'agent@contingencycopilot.com'];

    for (const deadline of deal.deadlines) {
      processedCount++;
      const targetDate = deadline.confirmedDate || deadline.computedDate;
      const daysDiff = differenceInCalendarDays(startOfDay(targetDate), startOfDay(now));

      let targetWindow: 'd3' | 'd1' | 'day_of' | 'missed' | null = null;

      if (daysDiff === 3 && (settings?.d3 ?? true)) {
        targetWindow = 'd3';
      } else if (daysDiff === 1 && (settings?.d1 ?? true)) {
        targetWindow = 'd1';
      } else if (daysDiff === 0 && (settings?.dayOf ?? true)) {
        targetWindow = 'day_of';
      } else if (daysDiff < 0 && (settings?.missed ?? true)) {
        targetWindow = 'missed';
      } else if (daysDiff > 1 && daysDiff < 3 && (settings?.d3 ?? true)) {
        // Catch-up rule: if confirmed inside window (e.g. 2 days before), trigger d3
        targetWindow = 'd3';
      }

      if (!targetWindow) continue;

      // Check idempotency via database unique constraint
      const existingLog = await prisma.emailLog.findUnique({
        where: {
          deadlineId_window: {
            deadlineId: deadline.id,
            window: targetWindow,
          },
        },
      });

      if (existingLog) continue; // Already sent for this window!

      // Send to all configured recipients
      for (const recipient of recipients) {
        const success = await sendEmailAlert({
          to: recipient,
          dealId: deal.id,
          deadlineId: deadline.id,
          deadlineLabel: deadline.label,
          deadlineDate: targetDate,
          daysUntilDeadline: daysDiff,
          templateName: targetWindow,
        });

        if (success) {
          sentCount++;
          await prisma.deadline.update({
            where: { id: deadline.id },
            data: { alertSentAt: new Date() },
          });
        }
      }
    }
  }

  logger.info(`[Scheduler] Tick complete: evaluated ${processedCount} deadlines across ${activeDeals.length} deals, sent ${sentCount} alert emails.`);
  return { processed: processedCount, sent: sentCount };
}

/**
 * Start background cron scheduler daemon
 */
export function startScheduler(): void {
  const cronExpression = process.env['ALERT_CRON'] || '0 * * * *'; // hourly default
  logger.info(`[Scheduler] Starting node-cron scheduler with schedule: "${cronExpression}"`);

  cronTask = cron.schedule(cronExpression, async () => {
    try {
      await runDeadlineSchedulerTick();
    } catch (err: unknown) {
      logger.error('[Scheduler] Error during scheduler execution tick:', err);
    }
  });
}

/**
 * Stop scheduler (for shutdown or tests)
 */
export function stopScheduler(): void {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    logger.info('[Scheduler] Scheduler stopped.');
  }
}
