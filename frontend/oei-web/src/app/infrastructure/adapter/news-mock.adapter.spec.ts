import { firstValueFrom } from 'rxjs';
import { NewsMockAdapter } from './news-mock.adapter';
import { resetArticleModerationFixtures } from './article-moderation-mock.adapter';

describe('NewsMockAdapter', () => {
  // `NewsMockAdapter` merges approved article submissions (see `article-moderation-mock.adapter.ts`)
  // into the feed; reset that module-level state so this file's expectations (fixed editorial
  // fixtures only) don't depend on execution order relative to moderation specs sharing the bundle.
  beforeEach(() => {
    resetArticleModerationFixtures();
  });

  it('givenFrenchLang_whenGetLatestNews_thenReturnsThreeDemoNewsItems', async () => {
    const adapter = new NewsMockAdapter();
    const news = await firstValueFrom(adapter.getLatestNews(3, 'fr'));
    expect(news.length).toBe(3);
    expect(news.every((item) => item.title.length > 0 && item.excerpt.length > 0)).toBe(true);
    expect(news.every((item) => item.imageUrl.startsWith('/assets/news/'))).toBe(true);
  });

  it('givenEnglishLang_whenGetLatestNews_thenReturnsEnglishTranslations', async () => {
    const adapter = new NewsMockAdapter();
    const news = await firstValueFrom(adapter.getLatestNews(3, 'en'));
    expect(news[0].title).toBe('Publication of the OEI White Paper');
  });

  it('givenUnsupportedLang_whenGetLatestNews_thenFallsBackToEnglish', async () => {
    const adapter = new NewsMockAdapter();
    const news = await firstValueFrom(adapter.getLatestNews(3, 'xx'));
    expect(news[0].title).toBe('Publication of the OEI White Paper');
  });

  it('givenLimitLowerThanFixtureCount_whenGetLatestNews_thenTruncatesResults', async () => {
    const adapter = new NewsMockAdapter();
    const news = await firstValueFrom(adapter.getLatestNews(2, 'fr'));
    expect(news.length).toBe(2);
  });
});
