import { isWithinReminderWindow, resolveFeeCycle } from './membership-fee-cycle';

function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

describe('resolveFeeCycle', () => {
  it('givenDateOnCycleStart_whenResolveFeeCycle_thenCycleStartsThatSameDay', () => {
    const cycle = resolveFeeCycle(utc(2026, 3, 22));
    expect(cycle.year).toBe(2026);
    expect(cycle.cycleStartDate).toEqual(utc(2026, 3, 22));
    expect(cycle.cycleEndDate).toEqual(utc(2027, 3, 21));
    expect(cycle.nextDueDate).toEqual(utc(2027, 3, 22));
  });

  it('givenDateOneDayBeforeCycleStart_whenResolveFeeCycle_thenBelongsToPreviousCycle', () => {
    const cycle = resolveFeeCycle(utc(2026, 3, 21));
    expect(cycle.year).toBe(2025);
    expect(cycle.cycleStartDate).toEqual(utc(2025, 3, 22));
    expect(cycle.cycleEndDate).toEqual(utc(2026, 3, 21));
  });

  it('givenDateMidCycle_whenResolveFeeCycle_thenReminderStartDateIsOneMonthBeforeNextDueDate', () => {
    const cycle = resolveFeeCycle(utc(2026, 8, 1)); // 1 September 2026, mid-cycle
    expect(cycle.year).toBe(2026);
    expect(cycle.reminderStartDate).toEqual(utc(2027, 2, 22));
    expect(cycle.nextDueDate).toEqual(utc(2027, 3, 22));
  });
});

describe('isWithinReminderWindow', () => {
  const cycle = resolveFeeCycle(utc(2026, 8, 1)); // cycle 2026-04-22 .. 2027-04-21

  it('givenDateBeforeReminderStart_whenIsWithinReminderWindow_thenFalse', () => {
    expect(isWithinReminderWindow(cycle, utc(2027, 2, 21))).toBe(false);
  });

  it('givenDateOnReminderStart_whenIsWithinReminderWindow_thenTrue', () => {
    expect(isWithinReminderWindow(cycle, utc(2027, 2, 22))).toBe(true);
  });

  it('givenDateOnCycleEnd_whenIsWithinReminderWindow_thenTrue', () => {
    expect(isWithinReminderWindow(cycle, utc(2027, 3, 21))).toBe(true);
  });

  it('givenDateAfterCycleEnd_whenIsWithinReminderWindow_thenFalse', () => {
    expect(isWithinReminderWindow(cycle, utc(2027, 3, 22))).toBe(false);
  });
});
