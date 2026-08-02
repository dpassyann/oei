export interface NewsItem {
  readonly title: string;
  readonly excerpt: string;
  readonly imageUrl: string;
  readonly path: string;
}

export function createNewsItem(fields: NewsItem): NewsItem {
  return Object.freeze({ ...fields });
}
