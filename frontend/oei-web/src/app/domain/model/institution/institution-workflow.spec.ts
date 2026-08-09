import {
  activate,
  approve,
  archive,
  availableActions,
  contact,
  reactivate,
  requestDocuments,
  revoke,
  suspend,
  WorkflowTransitionError,
} from './institution-workflow';

describe('institution-workflow', () => {
  it('givenDraft_whenContacted_thenMovesToContacted', () => {
    expect(contact('DRAFT')).toEqual({ status: 'CONTACTED' });
  });

  it('givenNonDraft_whenContacted_thenThrows', () => {
    expect(() => contact('CONTACTED')).toThrow(WorkflowTransitionError);
  });

  it('givenContacted_whenDocumentsRequested_thenMovesToDocumentsPending', () => {
    expect(requestDocuments('CONTACTED')).toEqual({ status: 'DOCUMENTS_PENDING' });
  });

  it('givenContactedOrDocumentsPending_whenApproved_thenMovesToApproved', () => {
    expect(approve('CONTACTED')).toEqual({ status: 'APPROVED' });
    expect(approve('DOCUMENTS_PENDING')).toEqual({ status: 'APPROVED' });
  });

  it('givenDraft_whenApproved_thenThrows', () => {
    expect(() => approve('DRAFT')).toThrow(WorkflowTransitionError);
  });

  it('givenApproved_whenActivated_thenMovesToActive', () => {
    expect(activate('APPROVED')).toEqual({ status: 'ACTIVE' });
  });

  it('givenNonApproved_whenActivated_thenThrows', () => {
    expect(() => activate('DRAFT')).toThrow(WorkflowTransitionError);
  });

  it('givenActive_whenSuspended_thenMovesToSuspended', () => {
    expect(suspend('ACTIVE')).toEqual({ status: 'SUSPENDED' });
  });

  it('givenNonActive_whenSuspended_thenThrows', () => {
    expect(() => suspend('SUSPENDED')).toThrow(WorkflowTransitionError);
  });

  it('givenSuspended_whenReactivated_thenMovesToActive', () => {
    expect(reactivate('SUSPENDED')).toEqual({ status: 'ACTIVE' });
  });

  describe('revoke', () => {
    it('givenActiveOrSuspended_whenRevokedWithReason_thenMovesToRevoked', () => {
      expect(revoke('ACTIVE', 'Fraude avérée (exemple).')).toEqual({ status: 'REVOKED' });
      expect(revoke('SUSPENDED', 'Non-respect de la charte (exemple).')).toEqual({ status: 'REVOKED' });
    });

    it('givenMissingReason_whenRevoked_thenThrows', () => {
      expect(() => revoke('ACTIVE', '')).toThrow(WorkflowTransitionError);
      expect(() => revoke('ACTIVE', '   ')).toThrow(WorkflowTransitionError);
    });

    it('givenNonRevocableStatus_whenRevoked_thenThrows', () => {
      expect(() => revoke('DRAFT', 'Peu importe.')).toThrow(WorkflowTransitionError);
    });
  });

  it('givenRevoked_whenArchived_thenMovesToArchived', () => {
    expect(archive('REVOKED')).toEqual({ status: 'ARCHIVED' });
  });

  it('givenNonRevoked_whenArchived_thenThrows', () => {
    expect(() => archive('ACTIVE')).toThrow(WorkflowTransitionError);
  });

  describe('availableActions', () => {
    it('givenEachStatus_whenListed_thenReturnsExpectedActions', () => {
      expect(availableActions('DRAFT')).toEqual(['contact']);
      expect(availableActions('CONTACTED')).toEqual(['requestDocuments', 'approve']);
      expect(availableActions('DOCUMENTS_PENDING')).toEqual(['approve']);
      expect(availableActions('APPROVED')).toEqual(['activate']);
      expect(availableActions('ACTIVE')).toEqual(['suspend', 'revoke']);
      expect(availableActions('SUSPENDED')).toEqual(['reactivate', 'revoke']);
      expect(availableActions('REVOKED')).toEqual(['archive']);
      expect(availableActions('ARCHIVED')).toEqual([]);
    });
  });
});
