// Governance entities from the "Modèle minimal" of `04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md`:
// the member proposal/consultation/decision process, distinct from `cms`'s publication workflow.
// Mirrors `ContentContribution`, `ContentComment`, `ContentDecision`, `DocumentSource` and
// `GitSynchronization` in `openapi/oei-api.yaml`.

export const CONTRIBUTION_STATUSES = ['PROPOSED', 'IN_CONSULTATION', 'ACCEPTED', 'REJECTED', 'MERGED'] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];

export interface ContentContribution {
  readonly id: string;
  readonly contentId: string;
  /** Markdown patch proposed by the member, diffable against the content's current version body. */
  readonly patch: string;
  readonly authorMemberId: string;
  readonly status: ContributionStatus;
  readonly createdAt: string;
}

export function createContentContribution(fields: ContentContribution): ContentContribution {
  return Object.freeze({ ...fields });
}

export interface ContentComment {
  readonly id: string;
  readonly contributionId: string | null;
  readonly contentId: string | null;
  readonly authorId: string;
  readonly body: string;
  readonly createdAt: string;
}

export function createContentComment(fields: ContentComment): ContentComment {
  return Object.freeze({ ...fields });
}

export interface ContentDecision {
  readonly id: string;
  readonly contentId: string;
  /** Business reference of the governance decision, e.g. "DEC-2026-001". */
  readonly decisionId: string;
  readonly sponsor: string;
  readonly justification: string;
  readonly effectiveDate: string;
  readonly publishedAt: string | null;
}

export function createContentDecision(fields: ContentDecision): ContentDecision {
  return Object.freeze({ ...fields });
}

export interface DocumentSource {
  readonly id: string;
  readonly contentId: string;
  readonly gitRepository: string;
  readonly gitPath: string;
  readonly gitRef: string;
}

export function createDocumentSource(fields: DocumentSource): DocumentSource {
  return Object.freeze({ ...fields });
}

export const GIT_SYNCHRONIZATION_STATUSES = ['RUNNING', 'SUCCESS', 'FAILED'] as const;
export type GitSynchronizationStatus = (typeof GIT_SYNCHRONIZATION_STATUSES)[number];

export interface GitSynchronization {
  readonly id: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly status: GitSynchronizationStatus;
  readonly commitsProcessed: number;
  readonly errors: readonly string[];
}

export function createGitSynchronization(fields: GitSynchronization): GitSynchronization {
  return Object.freeze({ ...fields, errors: Object.freeze([...fields.errors]) });
}

/** One Markdown file as seen by a (mocked, read-only) Git synchronization: matches the shape a
 * real webhook/polling pull from the normative repository would surface — a path, the commit
 * that last touched it, and its raw (front-matter + body) content. */
export interface GitSyncedFile {
  readonly path: string;
  readonly gitRef: string;
  readonly commitSha: string;
  readonly rawContent: string;
}
