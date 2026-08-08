export type ArticleSubmissionStatus = 'pending' | 'approved' | 'rejected';

// A member-authored article, submitted for moderation. Only once a CMS moderator approves it
// (out of scope here — handled by the CMS moderation queue, see `presentation/pages/cms/`) does
// it become visible on the public `/actualites` page; this domain model only covers the
// member-facing submission itself, never the moderation decision.
export interface ArticleSubmission {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly coverImageUrl?: string;
  readonly authorId: string;
  readonly status: ArticleSubmissionStatus;
  readonly submittedAt: string;
}

export function createArticleSubmission(fields: ArticleSubmission): ArticleSubmission {
  return Object.freeze({ ...fields });
}
