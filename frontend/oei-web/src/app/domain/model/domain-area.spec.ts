import { createDomainArea } from './domain-area';

describe('DomainArea', () => {
  it('givenValidFields_whenCreateDomainArea_thenReturnsFrozenDomainArea', () => {
    const area = createDomainArea({ icon: 'globe', title: 'Éducation', description: 'Programmes éducatifs' });
    expect(area.icon).toBe('globe');
    expect(area.title).toBe('Éducation');
    expect(area.description).toBe('Programmes éducatifs');
    expect(Object.isFrozen(area)).toBe(true);
  });
});
