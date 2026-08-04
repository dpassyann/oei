import { resolveFeeCycle } from './membership-fee-cycle';
import { calculateProratedFee } from './prorated-fee';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

// Fixed cycle: 22 April 2026 .. 21 April 2027 (365 days, no leap day in between).
const cycle = resolveFeeCycle(utc(2026, 8, 1));
const MEMBER_ANNUAL_FEE = 50; // "Membre" tier (see membership-fee-tier.ts)

describe('calculateProratedFee', () => {
  it('givenPaymentOnCycleStartDay_whenCalculateProratedFee_thenAmountIsFullAnnualFee', () => {
    const result = calculateProratedFee(MEMBER_ANNUAL_FEE, cycle.cycleStartDate, cycle);
    expect(result.amount).toBe(50);
    expect(result.monthsRemaining).toBe(12);
    expect(result.ratio).toBe(1);
  });

  it('givenPaymentAtMidCycle_whenCalculateProratedFee_thenAmountIsAboutHalf', () => {
    // Exactly 6 calendar months into the 12-month cycle (22 April -> 22 October).
    const result = calculateProratedFee(MEMBER_ANNUAL_FEE, utc(2026, 9, 22), cycle);
    expect(result.amount).toBeCloseTo(24.93, 2);
    expect(result.monthsRemaining).toBe(6);
  });

  it('givenPaymentJustBeforeCycleEnd_whenCalculateProratedFee_thenAmountIsNearZeroButNeverNegative', () => {
    const result = calculateProratedFee(MEMBER_ANNUAL_FEE, utc(2027, 3, 20), cycle);
    expect(result.amount).toBeCloseTo(0.27, 2);
    expect(result.amount).toBeGreaterThan(0);
  });

  it('givenPaymentOnTheLastDayOfTheCycle_whenCalculateProratedFee_thenAmountIsAlmostZero', () => {
    const result = calculateProratedFee(MEMBER_ANNUAL_FEE, cycle.cycleEndDate, cycle);
    expect(result.amount).toBeCloseTo(0.14, 2);
    expect(result.amount).toBeGreaterThanOrEqual(0);
  });

  it('givenPaymentDateAfterTheCycleAlreadyEnded_whenCalculateProratedFee_thenAmountIsZeroNeverNegative', () => {
    const result = calculateProratedFee(MEMBER_ANNUAL_FEE, cycle.nextDueDate, cycle);
    expect(result.amount).toBe(0);
    expect(result.amount).not.toBeLessThan(0);
  });

  it('givenDifferentAnnualFee_whenCalculateProratedFee_thenScalesProportionally', () => {
    const result = calculateProratedFee(250, utc(2026, 9, 22), cycle); // "Membre soutien" tier
    expect(result.amount).toBeCloseTo(124.66, 2);
  });
});
