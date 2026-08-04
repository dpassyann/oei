import { MembershipFeeCycle } from './membership-fee-cycle';

export interface ProratedFeeResult {
  /** Amount due, in euros, rounded to the nearest cent — never negative. */
  readonly amount: number;
  /** Remaining months until the cycle ends, out of 12, rounded to one decimal for display
   * (e.g. "6.2 mois restants sur les 12 du cycle"). */
  readonly monthsRemaining: number;
  /** Fraction (0..1) of the annual fee that remains to be covered. */
  readonly ratio: number;
  readonly remainingDays: number;
  readonly totalDays: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS_PER_YEAR = 12;

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Pure prorata calculation: a member paying mid-cycle only owes the fraction of the annual
 * fee corresponding to the time *remaining* until the cycle ends (the eve of the next 22
 * April due date) — not the whole year. Paying on the cycle's first day owes the full
 * amount; paying on its last day owes (almost) nothing; the result is always clamped to
 * `[0, annualFee]`, so it is never negative even for a `paymentDate` after the cycle end.
 */
export function calculateProratedFee(annualFee: number, paymentDate: Date, cycle: MembershipFeeCycle): ProratedFeeResult {
  const totalDays = daysBetween(cycle.cycleStartDate, cycle.cycleEndDate) + 1;
  const rawRemainingDays = daysBetween(paymentDate, cycle.cycleEndDate) + 1;
  const remainingDays = Math.min(totalDays, Math.max(0, rawRemainingDays));

  const ratio = totalDays > 0 ? remainingDays / totalDays : 0;
  const amount = Math.round(annualFee * ratio * 100) / 100;
  const monthsRemaining = Math.round(ratio * MONTHS_PER_YEAR * 10) / 10;

  return { amount, monthsRemaining, ratio, remainingDays, totalDays };
}
