import { createPartnership } from './partnership';

describe('Partnership', () => {
  it('givenValidFields_whenCreatePartnership_thenReturnsFrozenValue', () => {
    const partnership = createPartnership({
      institutionId: 'inst-demo',
      level: 'GOLD',
      verified: true,
      startedAt: '2025-01-01T00:00:00Z',
      endsAt: null,
      agreementDocumentUrl: null,
    });
    expect(partnership.level).toBe('GOLD');
    expect(Object.isFrozen(partnership)).toBe(true);
  });
});
