import { createInstitutionPublication, PUBLICATION_WORKFLOW_STEPS } from './institution-publication';

describe('InstitutionPublication', () => {
  it('exposesNineWorkflowStepsInOrder', () => {
    expect(PUBLICATION_WORKFLOW_STEPS).toEqual([
      'DRAFT',
      'SUBMITTED',
      'CHECKS',
      'REVIEW',
      'CHANGES_REQUESTED',
      'VALIDATED',
      'TRANSLATED',
      'PUBLISHED',
      'ARCHIVED',
    ]);
  });

  it('givenValidFields_whenCreateInstitutionPublication_thenReturnsFrozenValue', () => {
    const publication = createInstitutionPublication({
      id: 'pub-1',
      institutionId: 'inst-demo',
      type: 'STUDY',
      title: 'Étude de démonstration',
      body: 'Corps',
      status: 'DRAFT',
      authorMemberId: 'member-1',
      submittedAt: null,
      publishedAt: null,
    });
    expect(publication.status).toBe('DRAFT');
    expect(Object.isFrozen(publication)).toBe(true);
  });
});
