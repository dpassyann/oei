// Workflow status machine for `Content`, matching the "Workflow" section of
// `.prompt/plan/04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md` and `ContentWorkflowStatus` in
// `openapi/oei-api.yaml`.
//
// Design decision (documented — not specified verbatim by the plan): the plan lists a single
// linear chain (DRAFT -> IN_REVIEW -> LEGAL_REVIEW -> GOVERNANCE_REVIEW -> APPROVED ->
// TRANSLATION_PENDING -> SCHEDULED -> PUBLISHED -> ARCHIVED / REJECTED) but the OpenAPI contract
// only exposes 5 admin actions (`submit`, `approve`, `reject`, `publish`, `archive`) plus
// translation endpoints. We interpret each review status (`IN_REVIEW`, `LEGAL_REVIEW`,
// `GOVERNANCE_REVIEW`) as "this stage's review is currently in progress"; `approve` (with the
// `ContentApprovalCreation.role` tag `LEGAL`/`GOVERNANCE`) advances the content out of the
// *current* review stage into the next one, while `reject` (a distinct endpoint, per its own
// summary "retour en DRAFT avec commentaire") sends work back for rework rather than terminating
// it. A `decision: REJECTED` on `approve` is the terminal rejection (`REJECTED` status). Only the
// Keycloak `admin` role may drive any transition (no dedicated CMS role was introduced, per ADR
// 0002 §Décision 2 and this task's brief).
import { ContentWorkflowStatus } from './content.model';

export type KeycloakRole = 'member' | 'admin';
export type ApprovalGateRole = 'LEGAL' | 'GOVERNANCE';
export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export const CONTENT_WORKFLOW_STATUSES = [
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
] as const satisfies readonly ContentWorkflowStatus[];

/** The approval gate role expected to be reviewing content currently sitting in a given status. */
export const APPROVAL_GATE_BY_STATUS: Partial<Record<ContentWorkflowStatus, ApprovalGateRole>> = {
  IN_REVIEW: 'LEGAL',
  LEGAL_REVIEW: 'GOVERNANCE',
  GOVERNANCE_REVIEW: 'GOVERNANCE',
};

/** Status reached once the gate at a given status is approved. */
const NEXT_STATUS_ON_APPROVAL: Partial<Record<ContentWorkflowStatus, ContentWorkflowStatus>> = {
  IN_REVIEW: 'LEGAL_REVIEW',
  LEGAL_REVIEW: 'GOVERNANCE_REVIEW',
  GOVERNANCE_REVIEW: 'APPROVED',
};

const REQUIRED_ROLE: KeycloakRole = 'admin';

export interface WorkflowActionResult {
  readonly status: ContentWorkflowStatus;
}

export class WorkflowTransitionError extends Error {}

function assertAdmin(role: KeycloakRole, action: string): void {
  if (role !== REQUIRED_ROLE) {
    throw new WorkflowTransitionError(`Action "${action}" requires the "${REQUIRED_ROLE}" role, got "${role}".`);
  }
}

/** DRAFT -> IN_REVIEW. */
export function submit(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'submit');
  if (status !== 'DRAFT') {
    throw new WorkflowTransitionError(`Cannot submit content from status "${status}" (expected DRAFT).`);
  }
  return { status: 'IN_REVIEW' };
}

/** Advances (or terminates) content out of its current review gate. */
export function approve(
  status: ContentWorkflowStatus,
  role: KeycloakRole,
  gateRole: ApprovalGateRole,
  decision: ApprovalDecision,
): WorkflowActionResult {
  assertAdmin(role, 'approve');
  const expectedGate = APPROVAL_GATE_BY_STATUS[status];
  if (!expectedGate) {
    throw new WorkflowTransitionError(`Content in status "${status}" is not awaiting any approval gate.`);
  }
  if (expectedGate !== gateRole) {
    throw new WorkflowTransitionError(`Content in status "${status}" awaits a "${expectedGate}" approval, got "${gateRole}".`);
  }
  if (decision === 'REJECTED') {
    return { status: 'REJECTED' };
  }
  if (decision === 'CHANGES_REQUESTED') {
    return { status: 'DRAFT' };
  }
  return { status: NEXT_STATUS_ON_APPROVAL[status] as ContentWorkflowStatus };
}

/** Sends content back to DRAFT for rework (distinct from a terminal `REJECTED` decision). */
export function reject(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'reject');
  const reviewStatuses: readonly ContentWorkflowStatus[] = ['IN_REVIEW', 'LEGAL_REVIEW', 'GOVERNANCE_REVIEW'];
  if (!reviewStatuses.includes(status)) {
    throw new WorkflowTransitionError(`Cannot reject content from status "${status}" (expected a review status).`);
  }
  return { status: 'DRAFT' };
}

/** APPROVED -> TRANSLATION_PENDING (a translation is required before scheduling/publication). */
export function requestTranslation(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'requestTranslation');
  if (status !== 'APPROVED') {
    throw new WorkflowTransitionError(`Cannot request a translation from status "${status}" (expected APPROVED).`);
  }
  return { status: 'TRANSLATION_PENDING' };
}

/** APPROVED | TRANSLATION_PENDING -> SCHEDULED. */
export function schedule(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'schedule');
  const schedulable: readonly ContentWorkflowStatus[] = ['APPROVED', 'TRANSLATION_PENDING'];
  if (!schedulable.includes(status)) {
    throw new WorkflowTransitionError(`Cannot schedule content from status "${status}".`);
  }
  return { status: 'SCHEDULED' };
}

/** APPROVED | SCHEDULED -> PUBLISHED (matches `publishAdminContent`'s OpenAPI summary exactly). */
export function publish(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'publish');
  const publishable: readonly ContentWorkflowStatus[] = ['APPROVED', 'SCHEDULED'];
  if (!publishable.includes(status)) {
    throw new WorkflowTransitionError(`Cannot publish content from status "${status}" (expected APPROVED or SCHEDULED).`);
  }
  return { status: 'PUBLISHED' };
}

/** PUBLISHED -> ARCHIVED. Never a physical deletion (acceptance constraint of the CMS plan). */
export function archive(status: ContentWorkflowStatus, role: KeycloakRole): WorkflowActionResult {
  assertAdmin(role, 'archive');
  if (status !== 'PUBLISHED') {
    throw new WorkflowTransitionError(`Cannot archive content from status "${status}" (expected PUBLISHED).`);
  }
  return { status: 'ARCHIVED' };
}

export type WorkflowActionName = 'submit' | 'approve' | 'reject' | 'requestTranslation' | 'schedule' | 'publish' | 'archive';

/** Which actions are currently available for a given status, used by the back-office UI to
 * decide which buttons to show — independent of role (role-gating happens when the action is
 * actually invoked, via the functions above, so a forbidden click still fails loudly). */
export function availableActions(status: ContentWorkflowStatus): readonly WorkflowActionName[] {
  switch (status) {
    case 'DRAFT':
      return ['submit'];
    case 'IN_REVIEW':
    case 'LEGAL_REVIEW':
    case 'GOVERNANCE_REVIEW':
      return ['approve', 'reject'];
    case 'APPROVED':
      return ['requestTranslation', 'schedule', 'publish'];
    case 'TRANSLATION_PENDING':
      return ['schedule', 'publish'];
    case 'SCHEDULED':
      return ['publish'];
    case 'PUBLISHED':
      return ['archive'];
    case 'ARCHIVED':
    case 'REJECTED':
      return [];
  }
}
