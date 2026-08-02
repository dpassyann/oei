import { NewsMockAdapter } from './news-mock.adapter';

describe('NewsMockAdapter', () => {
  it('givenNoRealNewsYet_whenGetLatestNews_thenReturnsEmptyArray', async () => {
    const adapter = new NewsMockAdapter();
    const news = await adapter.getLatestNews(3);
    expect(news).toEqual([]);
  });
});
