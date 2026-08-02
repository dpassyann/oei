import { createStat } from './stat';

describe('Stat', () => {
  it('givenValidFields_whenCreateStat_thenReturnsFrozenStat', () => {
    const stat = createStat({ label: 'Membres', value: 42 });
    expect(stat.label).toBe('Membres');
    expect(stat.value).toBe(42);
    expect(Object.isFrozen(stat)).toBe(true);
  });
});
