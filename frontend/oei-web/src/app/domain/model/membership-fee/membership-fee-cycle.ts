// Annual cotisation cycle: the call for cotisation ("appel à cotisation") is issued every
// year on 22 April, and each cycle runs until the eve of the following year's 22 April
// (i.e. 21 April the next year). Reminder emails (modelled here, never actually sent — no
// mail backend in this plan) start exactly one month before the *next* due date, i.e. 22
// March of the cycle's final year.
//
// All dates are computed in UTC to keep the pure functions below deterministic and
// timezone-independent (verified by `membership-fee-cycle.spec.ts`).
export interface MembershipFeeCycle {
  /** The calendar year the cycle started in (its `cycleStartDate` is 22 April of this year). */
  readonly year: number;
  readonly cycleStartDate: Date;
  /** Eve of the next cycle's start (21 April the following year). */
  readonly cycleEndDate: Date;
  /** 22 March of the cycle's final year — one month before the next 22 April due date. */
  readonly reminderStartDate: Date;
  /** The next call-for-cotisation due date (22 April the following year). */
  readonly nextDueDate: Date;
}

const CYCLE_MONTH_APRIL = 3; // 0-indexed
const CYCLE_DAY = 22;
const REMINDER_MONTH_MARCH = 2; // 0-indexed

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/**
 * Resolves the membership fee cycle that `referenceDate` falls into: the cycle starting on
 * the most recent 22 April on or before `referenceDate`, and ending the eve of the next one.
 */
export function resolveFeeCycle(referenceDate: Date): MembershipFeeCycle {
  const aprilTwentySecondThisYear = utcDate(referenceDate.getUTCFullYear(), CYCLE_MONTH_APRIL, CYCLE_DAY);
  const year = referenceDate.getTime() >= aprilTwentySecondThisYear.getTime() ? referenceDate.getUTCFullYear() : referenceDate.getUTCFullYear() - 1;

  const cycleStartDate = utcDate(year, CYCLE_MONTH_APRIL, CYCLE_DAY);
  const nextDueDate = utcDate(year + 1, CYCLE_MONTH_APRIL, CYCLE_DAY);
  const cycleEndDate = utcDate(year + 1, CYCLE_MONTH_APRIL, CYCLE_DAY - 1);
  const reminderStartDate = utcDate(year + 1, REMINDER_MONTH_MARCH, CYCLE_DAY);

  return { year, cycleStartDate, cycleEndDate, reminderStartDate, nextDueDate };
}

/** Whether `referenceDate` falls within the reminder window (22 March up to and including
 * the cycle's last day, 21 April) — i.e. "your cotisation is due 22 April" should be shown. */
export function isWithinReminderWindow(cycle: MembershipFeeCycle, referenceDate: Date): boolean {
  return referenceDate.getTime() >= cycle.reminderStartDate.getTime() && referenceDate.getTime() <= cycle.cycleEndDate.getTime();
}
