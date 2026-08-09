// Workflow status machine for `Institution` (admin-side onboarding/lifecycle), matching
// `.prompt/plan/final/02-PARTNERS-AND-INSTITUTION-ADMIN.md` §Workflow. Same design as
// `domain/model/cms/content-workflow.ts`: pure functions, a dedicated `WorkflowTransitionError`,
// and an `availableActions` helper the back-office UI uses to decide which buttons to show
// (role/permission gating for *who* may click them is a separate concern — see
// `presentation/auth/admin.guard.ts` and `domain/model/admin/admin-role.ts`).
import { InstitutionWorkflowStatus } from './institution';

export const INSTITUTION_WORKFLOW_STATUSES = [
  'DRAFT',
  'CONTACTED',
  'DOCUMENTS_PENDING',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
  'ARCHIVED',
] as const satisfies readonly InstitutionWorkflowStatus[];

export class WorkflowTransitionError extends Error {}

export interface InstitutionWorkflowResult {
  readonly status: InstitutionWorkflowStatus;
}

/** DRAFT -> CONTACTED: a first exchange happened with the organization (task brief §Vision). */
export function contact(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'DRAFT') {
    throw new WorkflowTransitionError(`Cannot mark as contacted from status "${status}" (expected DRAFT).`);
  }
  return { status: 'CONTACTED' };
}

/** CONTACTED -> DOCUMENTS_PENDING: waiting on supporting documents before approval. */
export function requestDocuments(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'CONTACTED') {
    throw new WorkflowTransitionError(`Cannot request documents from status "${status}" (expected CONTACTED).`);
  }
  return { status: 'DOCUMENTS_PENDING' };
}

/** CONTACTED | DOCUMENTS_PENDING -> APPROVED. */
export function approve(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  const approvable: readonly InstitutionWorkflowStatus[] = ['CONTACTED', 'DOCUMENTS_PENDING'];
  if (!approvable.includes(status)) {
    throw new WorkflowTransitionError(`Cannot approve institution from status "${status}" (expected CONTACTED or DOCUMENTS_PENDING).`);
  }
  return { status: 'APPROVED' };
}

/**
 * APPROVED -> ACTIVE. This is the pure status transition only — the actual Keycloak
 * provisioning chain (create institution admin user, send activation email, assign role,
 * force password change, audit log) is simulated at the adapter layer, never here. See
 * `infrastructure/adapter/admin-institutions-mock.adapter.ts`'s `activate()` doc comment.
 */
export function activate(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'APPROVED') {
    throw new WorkflowTransitionError(`Cannot activate institution from status "${status}" (expected APPROVED).`);
  }
  return { status: 'ACTIVE' };
}

/** ACTIVE -> SUSPENDED. Never a hard delete (task brief §Soft delete). */
export function suspend(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'ACTIVE') {
    throw new WorkflowTransitionError(`Cannot suspend institution from status "${status}" (expected ACTIVE).`);
  }
  return { status: 'SUSPENDED' };
}

/** SUSPENDED -> ACTIVE: lifts a suspension (distinct from `activate`, which is the first-ever
 * activation and would trigger provisioning again if reused for this purpose). */
export function reactivate(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'SUSPENDED') {
    throw new WorkflowTransitionError(`Cannot reactivate institution from status "${status}" (expected SUSPENDED).`);
  }
  return { status: 'ACTIVE' };
}

/**
 * ACTIVE | SUSPENDED -> REVOKED. `reason` is mandatory (task brief: "Raison obligatoire de
 * révocation et audit complet") — a missing or blank reason throws rather than silently revoking.
 */
export function revoke(status: InstitutionWorkflowStatus, reason: string): InstitutionWorkflowResult {
  const revocable: readonly InstitutionWorkflowStatus[] = ['ACTIVE', 'SUSPENDED'];
  if (!revocable.includes(status)) {
    throw new WorkflowTransitionError(`Cannot revoke institution from status "${status}" (expected ACTIVE or SUSPENDED).`);
  }
  if (!reason || !reason.trim()) {
    throw new WorkflowTransitionError('Revoking an institution requires a non-empty reason.');
  }
  return { status: 'REVOKED' };
}

/** REVOKED -> ARCHIVED: final soft-delete state, history preserved (task brief §Soft delete). */
export function archive(status: InstitutionWorkflowStatus): InstitutionWorkflowResult {
  if (status !== 'REVOKED') {
    throw new WorkflowTransitionError(`Cannot archive institution from status "${status}" (expected REVOKED).`);
  }
  return { status: 'ARCHIVED' };
}

export type InstitutionWorkflowActionName = 'contact' | 'requestDocuments' | 'approve' | 'activate' | 'suspend' | 'reactivate' | 'revoke' | 'archive';

/** Which action buttons the admin back-office should show for a given institution status. */
export function availableActions(status: InstitutionWorkflowStatus): readonly InstitutionWorkflowActionName[] {
  switch (status) {
    case 'DRAFT':
      return ['contact'];
    case 'CONTACTED':
      return ['requestDocuments', 'approve'];
    case 'DOCUMENTS_PENDING':
      return ['approve'];
    case 'APPROVED':
      return ['activate'];
    case 'ACTIVE':
      return ['suspend', 'revoke'];
    case 'SUSPENDED':
      return ['reactivate', 'revoke'];
    case 'REVOKED':
      return ['archive'];
    case 'ARCHIVED':
      return [];
  }
}
