// Core CMS entities from the "Modèle minimal" of `.prompt/plan/04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md`,
// mirrored on the `Content`/`ContentVersion`/`ContentTranslation`/`ContentApproval`/
// `ContentPublication`/`MediaAsset`/`BookCompilation`/`PdfGenerationJob` schemas of
// `openapi/oei-api.yaml`. `ContentApproval` lives here (not in `governance/`) because it gates the
// `ContentVersion` workflow directly; `ContentDecision`/`ContentContribution`/`ContentComment`
// (the proposal/consultation/decision process) live in `domain/model/governance/`.
import { ContentType } from './content-type';

export const CONTENT_WORKFLOW_STATUS_VALUES = [
  'DRAFT',
  'IN_REVIEW',
  'LEGAL_REVIEW',
  'GOVERNANCE_REVIEW',
  'APPROVED',
  'TRANSLATION_PENDING',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
  'REJECTED',
] as const;
export type ContentWorkflowStatus = (typeof CONTENT_WORKFLOW_STATUS_VALUES)[number];

export const CONTENT_SOURCE_TYPES = ['GIT', 'CMS'] as const;
export type ContentSourceType = (typeof CONTENT_SOURCE_TYPES)[number];

export interface ContentGovernance {
  readonly approvalRequired: boolean;
  readonly decisionId: string | null;
}

export interface Content {
  readonly id: string;
  readonly type: ContentType;
  readonly slug: string;
  readonly sourceType: ContentSourceType;
  readonly title: string;
  readonly tags: readonly string[];
  readonly governance: ContentGovernance;
  readonly currentVersionId: string | null;
  readonly status: ContentWorkflowStatus;
}

export function createContent(fields: Content): Content {
  return Object.freeze({ ...fields, tags: Object.freeze([...fields.tags]), governance: Object.freeze({ ...fields.governance }) });
}

/** Minimal `PageMetadata` shape, matching `openapi/oei-api.yaml`'s `PageMetadata` schema — used
 * here only for `ContentPage`, the API adapter's list response envelope. */
export interface PageMetadata {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
}

export interface ContentPage {
  readonly items: readonly Content[];
  readonly pageMetadata: PageMetadata;
}

export interface ContentVersion {
  readonly id: string;
  readonly contentId: string;
  readonly version: string;
  readonly language: string;
  readonly title: string;
  readonly body: string;
  readonly frontMatter?: Record<string, unknown>;
  readonly authorIds: readonly string[];
  readonly status: ContentWorkflowStatus;
  readonly createdAt: string;
}

export function createContentVersion(fields: ContentVersion): ContentVersion {
  return Object.freeze({ ...fields, authorIds: Object.freeze([...fields.authorIds]) });
}

export interface ContentVersionPage {
  readonly items: readonly ContentVersion[];
  readonly pageMetadata: PageMetadata;
}

export const CONTENT_TRANSLATION_STATUSES = ['PENDING', 'MACHINE_GENERATED', 'IN_REVIEW', 'VALIDATED', 'OUTDATED'] as const;
export type ContentTranslationStatus = (typeof CONTENT_TRANSLATION_STATUSES)[number];

export interface ContentTranslation {
  readonly id: string;
  readonly contentVersionId: string;
  readonly language: string;
  readonly status: ContentTranslationStatus;
  readonly translatorId: string | null;
  readonly validatedBy: string | null;
  readonly validatedAt: string | null;
}

export function createContentTranslation(fields: ContentTranslation): ContentTranslation {
  return Object.freeze({ ...fields });
}

export const APPROVAL_GATE_ROLES = ['LEGAL', 'GOVERNANCE'] as const;
export type ApprovalGateRole = (typeof APPROVAL_GATE_ROLES)[number];

export const APPROVAL_DECISIONS = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'] as const;
export type ApprovalDecisionValue = (typeof APPROVAL_DECISIONS)[number];

export interface ContentApproval {
  readonly id: string;
  readonly contentVersionId: string;
  readonly role: ApprovalGateRole;
  readonly decision: ApprovalDecisionValue;
  readonly comment: string;
  readonly approverId: string;
  readonly decidedAt: string;
}

export function createContentApproval(fields: ContentApproval): ContentApproval {
  return Object.freeze({ ...fields });
}

export interface ContentPublication {
  readonly id: string;
  readonly contentVersionId: string;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly channel: string;
}

export function createContentPublication(fields: ContentPublication): ContentPublication {
  return Object.freeze({ ...fields });
}

export const MEDIA_SCAN_STATUSES = ['PENDING', 'CLEAN', 'INFECTED'] as const;
export type MediaScanStatus = (typeof MEDIA_SCAN_STATUSES)[number];

export interface MediaAsset {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly uploadedBy: string;
  readonly uploadedAt: string;
  readonly scanStatus: MediaScanStatus;
}

export function createMediaAsset(fields: MediaAsset): MediaAsset {
  return Object.freeze({ ...fields });
}

export interface BookCompilation {
  readonly id: string;
  readonly title: string;
  readonly contentIds: readonly string[];
  readonly coverAssetId: string | null;
  readonly isbn: string | null;
  readonly tableOfContents: readonly string[];
  readonly version: string;
}

export function createBookCompilation(fields: BookCompilation): BookCompilation {
  return Object.freeze({
    ...fields,
    contentIds: Object.freeze([...fields.contentIds]),
    tableOfContents: Object.freeze([...fields.tableOfContents]),
  });
}

export const PDF_GENERATION_JOB_STATUSES = ['QUEUED', 'PROCESSING', 'DONE', 'FAILED'] as const;
export type PdfGenerationJobStatus = (typeof PDF_GENERATION_JOB_STATUSES)[number];
export const PDF_GENERATION_TARGET_TYPES = ['CV', 'BOOK'] as const;
export type PdfGenerationTargetType = (typeof PDF_GENERATION_TARGET_TYPES)[number];

export interface PdfGenerationJob {
  readonly id: string;
  readonly targetType: PdfGenerationTargetType;
  readonly targetId: string;
  readonly status: PdfGenerationJobStatus;
  readonly resultUrl: string | null;
  readonly requestedAt: string;
  readonly completedAt: string | null;
}

export function createPdfGenerationJob(fields: PdfGenerationJob): PdfGenerationJob {
  return Object.freeze({ ...fields });
}
