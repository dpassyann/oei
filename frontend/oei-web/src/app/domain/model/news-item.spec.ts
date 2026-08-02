import { createNewsItem } from './news-item';

describe('NewsItem', () => {
  it('givenValidFields_whenCreateNewsItem_thenReturnsFrozenNewsItem', () => {
    const item = createNewsItem({
      title: 'Nouvelle publication',
      excerpt: 'Un résumé',
      imageUrl: '/assets/news.jpg',
      path: '/news/nouvelle-publication',
    });
    expect(item.title).toBe('Nouvelle publication');
    expect(item.excerpt).toBe('Un résumé');
    expect(item.imageUrl).toBe('/assets/news.jpg');
    expect(item.path).toBe('/news/nouvelle-publication');
    expect(Object.isFrozen(item)).toBe(true);
  });
});
