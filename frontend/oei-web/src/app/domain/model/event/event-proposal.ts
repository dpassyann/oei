import { EventType } from './event';

// Member-submitted event proposal, ahead of any moderation decision. Never appears on the
// public `/events` agenda directly — only once a moderator `approve`s it (see
// `EVENT_MODERATION_PORT`) does it become a published `Event` (out of scope for this model,
// mirrors `ArticleSubmission` vs. the CMS `Content`/`AdminContentPort` split elsewhere in this
// codebase).
//
// Workflow: DRAFT -> SUBMITTED -> AI_PRECHECK -> MODERATOR_REVIEW -> APPROVED -> PUBLISHED,
// with CHANGES_REQUESTED / REJECTED / CANCELLED / ENDED / ARCHIVED as the other reachable states.
// The AI precheck never auto-publishes in V1 — it only assists the human moderator (fautes,
// injures, spam, pertinence) — see `aiPrecheck` below, always a static/simulated result in mock.
export type EventProposalStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_PRECHECK'
  | 'MODERATOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ENDED'
  | 'ARCHIVED';

export interface EventProposalAiPrecheck {
  readonly passed: boolean;
  readonly summary: string;
  readonly checkedAt: string;
}

export interface EventProposal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: EventType;
  readonly startAt: string;
  readonly endAt: string;
  readonly timezone: string;
  readonly country: string;
  readonly city?: string;
  readonly venue?: string;
  readonly onlineUrl?: string;
  readonly imageUrl?: string;
  readonly authorId: string;
  readonly status: EventProposalStatus;
  readonly submittedAt?: string;
  readonly aiPrecheck?: EventProposalAiPrecheck;
  readonly moderatorNote?: string;
}

export function createEventProposal(fields: EventProposal): EventProposal {
  return Object.freeze({ ...fields });
}
