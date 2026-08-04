import { createDomainArea } from './domain-area';

describe('DomainArea', () => {
  it('givenValidFields_whenCreateDomainArea_thenReturnsFrozenDomainArea', () => {
    const area = createDomainArea({
      slug: 'education',
      icon: 'globe',
      title: 'Éducation',
      description: 'Programmes éducatifs',
      lastModified: '2026-01-15',
    });
    expect(area.slug).toBe('education');
    expect(area.icon).toBe('globe');
    expect(area.title).toBe('Éducation');
    expect(area.description).toBe('Programmes éducatifs');
    expect(area.lastModified).toBe('2026-01-15');
    expect(Object.isFrozen(area)).toBe(true);
  });
});
