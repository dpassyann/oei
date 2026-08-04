import { describe, expect, it } from 'vitest';
import { approve, archive, availableActions, publish, reject, requestTranslation, schedule, submit, WorkflowTransitionError } from './content-workflow';

describe('content-workflow', () => {
  describe('submit', () => {
    it('givenDraft_whenSubmittedByAdmin_thenMovesToInReview', () => {
      expect(submit('DRAFT', 'admin')).toEqual({ status: 'IN_REVIEW' });
    });

    it('givenNonDraft_whenSubmitted_thenThrows', () => {
      expect(() => submit('IN_REVIEW', 'admin')).toThrow(WorkflowTransitionError);
    });

    it('givenMemberRole_whenSubmitted_thenThrows', () => {
      expect(() => submit('DRAFT', 'member')).toThrow(WorkflowTransitionError);
    });
  });

  describe('approve', () => {
    it('givenInReview_whenApprovedByLegal_thenMovesToLegalReview', () => {
      expect(approve('IN_REVIEW', 'admin', 'LEGAL', 'APPROVED')).toEqual({ status: 'LEGAL_REVIEW' });
    });

    it('givenLegalReview_whenApprovedByGovernance_thenMovesToGovernanceReview', () => {
      expect(approve('LEGAL_REVIEW', 'admin', 'GOVERNANCE', 'APPROVED')).toEqual({ status: 'GOVERNANCE_REVIEW' });
    });

    it('givenGovernanceReview_whenApprovedByGovernance_thenMovesToApproved', () => {
      expect(approve('GOVERNANCE_REVIEW', 'admin', 'GOVERNANCE', 'APPROVED')).toEqual({ status: 'APPROVED' });
    });

    it('givenWrongGateRole_whenApproved_thenThrows', () => {
      expect(() => approve('IN_REVIEW', 'admin', 'GOVERNANCE', 'APPROVED')).toThrow(WorkflowTransitionError);
    });

    it('givenStatusNotAwaitingApproval_whenApproved_thenThrows', () => {
      expect(() => approve('DRAFT', 'admin', 'LEGAL', 'APPROVED')).toThrow(WorkflowTransitionError);
    });

    it('givenChangesRequested_whenApproved_thenMovesBackToDraft', () => {
      expect(approve('IN_REVIEW', 'admin', 'LEGAL', 'CHANGES_REQUESTED')).toEqual({ status: 'DRAFT' });
    });

    it('givenRejectedDecision_whenApproved_thenMovesToTerminalRejected', () => {
      expect(approve('GOVERNANCE_REVIEW', 'admin', 'GOVERNANCE', 'REJECTED')).toEqual({ status: 'REJECTED' });
    });
  });

  describe('reject', () => {
    it('givenReviewStatus_whenRejected_thenMovesBackToDraft', () => {
      expect(reject('IN_REVIEW', 'admin')).toEqual({ status: 'DRAFT' });
    });

    it('givenNonReviewStatus_whenRejected_thenThrows', () => {
      expect(() => reject('DRAFT', 'admin')).toThrow(WorkflowTransitionError);
    });
  });

  describe('requestTranslation / schedule / publish / archive', () => {
    it('givenApproved_whenTranslationRequested_thenMovesToTranslationPending', () => {
      expect(requestTranslation('APPROVED', 'admin')).toEqual({ status: 'TRANSLATION_PENDING' });
    });

    it('givenApprovedOrTranslationPending_whenScheduled_thenMovesToScheduled', () => {
      expect(schedule('APPROVED', 'admin')).toEqual({ status: 'SCHEDULED' });
      expect(schedule('TRANSLATION_PENDING', 'admin')).toEqual({ status: 'SCHEDULED' });
    });

    it('givenApprovedOrScheduled_whenPublished_thenMovesToPublished', () => {
      expect(publish('APPROVED', 'admin')).toEqual({ status: 'PUBLISHED' });
      expect(publish('SCHEDULED', 'admin')).toEqual({ status: 'PUBLISHED' });
    });

    it('givenNonPublishableStatus_whenPublished_thenThrows', () => {
      expect(() => publish('DRAFT', 'admin')).toThrow(WorkflowTransitionError);
    });

    it('givenPublished_whenArchived_thenMovesToArchived', () => {
      expect(archive('PUBLISHED', 'admin')).toEqual({ status: 'ARCHIVED' });
    });

    it('givenNonPublished_whenArchived_thenThrows', () => {
      expect(() => archive('DRAFT', 'admin')).toThrow(WorkflowTransitionError);
    });
  });

  describe('availableActions', () => {
    it('givenEachStatus_whenListed_thenReturnsExpectedActions', () => {
      expect(availableActions('DRAFT')).toEqual(['submit']);
      expect(availableActions('IN_REVIEW')).toEqual(['approve', 'reject']);
      expect(availableActions('APPROVED')).toEqual(['requestTranslation', 'schedule', 'publish']);
      expect(availableActions('TRANSLATION_PENDING')).toEqual(['schedule', 'publish']);
      expect(availableActions('SCHEDULED')).toEqual(['publish']);
      expect(availableActions('PUBLISHED')).toEqual(['archive']);
      expect(availableActions('ARCHIVED')).toEqual([]);
      expect(availableActions('REJECTED')).toEqual([]);
    });
  });
});
