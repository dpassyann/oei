import { firstValueFrom } from 'rxjs';
import { CvMockAdapter } from './cv-mock.adapter';

describe('CvMockAdapter', () => {
  it('givenSeededTemplates_whenListTemplates_thenReturnsTheTwoPremiumTemplates', async () => {
    const adapter = new CvMockAdapter();
    const templates = await firstValueFrom(adapter.listTemplates());
    expect(templates.map((template) => template.code)).toEqual(['CLASSIC', 'MODERN']);
  });

  it('givenSeededCv_whenListCvs_thenReturnsDemoCvForDemoMember', async () => {
    const adapter = new CvMockAdapter();
    const cvs = await firstValueFrom(adapter.listCvs());
    expect(cvs).toHaveLength(1);
    expect(cvs[0].id).toBe('demo-cv-1');
    expect(cvs[0].memberId).toBe('demo-member-1');
    expect(cvs[0].sections).toHaveLength(2);
  });

  it('givenExistingCv_whenGetCv_thenReturnsIt', async () => {
    const adapter = new CvMockAdapter();
    const cv = await firstValueFrom(adapter.getCv('demo-cv-1'));
    expect(cv.templateId).toBe('tpl-classic');
  });

  it('givenNewCv_whenCreateCv_thenAddsItToInMemoryStoreAndReturnsIt', async () => {
    const adapter = new CvMockAdapter();
    const created = await firstValueFrom(adapter.createCv({ templateId: 'tpl-modern', sourceLanguage: 'en' }));
    expect(created.memberId).toBe('demo-member-1');
    expect(created.status).toBe('DRAFT');
    const cvs = await firstValueFrom(adapter.listCvs());
    expect(cvs).toHaveLength(2);
  });

  it('givenUpdatedCv_whenUpdateCv_thenReplacesStoredCv', async () => {
    const adapter = new CvMockAdapter();
    const existing = await firstValueFrom(adapter.getCv('demo-cv-1'));
    const updated = await firstValueFrom(adapter.updateCv('demo-cv-1', { ...existing, status: 'READY' }));
    expect(updated.status).toBe('READY');
    const reFetched = await firstValueFrom(adapter.getCv('demo-cv-1'));
    expect(reFetched.status).toBe('READY');
  });

  it('givenNewSection_whenAddSection_thenAppendsItWithGeneratedId', async () => {
    const adapter = new CvMockAdapter();
    const section = await firstValueFrom(
      adapter.addSection('demo-cv-1', { type: 'SKILL', order: 2, content: { name: 'TypeScript' } }),
    );
    expect(section.id).toBeTruthy();
    expect(section.cvId).toBe('demo-cv-1');
    expect(section.translations).toEqual([]);
    const cv = await firstValueFrom(adapter.getCv('demo-cv-1'));
    expect(cv.sections).toHaveLength(3);
  });

  it('givenExistingSection_whenUpdateSection_thenMutatesIt', async () => {
    const adapter = new CvMockAdapter();
    const cv = await firstValueFrom(adapter.getCv('demo-cv-1'));
    const target = cv.sections[1];
    const updated = await firstValueFrom(
      adapter.updateSection('demo-cv-1', target.id, { ...target, content: { text: 'Nouveau résumé' } }),
    );
    expect(updated.content).toEqual({ text: 'Nouveau résumé' });
  });

  it('givenTranslation_whenAddTranslation_thenStaysMachineGeneratedNeverAutoValidated', async () => {
    const adapter = new CvMockAdapter();
    const cv = await firstValueFrom(adapter.getCv('demo-cv-1'));
    const sectionId = cv.sections[0].id;
    const translation = await firstValueFrom(
      adapter.addTranslation('demo-cv-1', sectionId, { language: 'en', content: { fullName: 'Jane Dupont' } }),
    );
    expect(translation.status).toBe('MACHINE_GENERATED');
    expect(translation.validatedBy).toBeUndefined();
  });

  it('givenMachineGeneratedTranslation_whenValidateTranslation_thenMarksItValidatedByDemoMember', async () => {
    const adapter = new CvMockAdapter();
    const cv = await firstValueFrom(adapter.getCv('demo-cv-1'));
    const sectionId = cv.sections[0].id;
    await firstValueFrom(adapter.addTranslation('demo-cv-1', sectionId, { language: 'en', content: {} }));
    const validated = await firstValueFrom(adapter.validateTranslation('demo-cv-1', sectionId, 'en'));
    expect(validated.status).toBe('VALIDATED');
    expect(validated.validatedBy).toBe('demo-member-1');
  });

  it('givenRenderRequest_whenRenderCv_thenReturnsDoneJobWithMockPdfUrl', async () => {
    const adapter = new CvMockAdapter();
    const job = await firstValueFrom(adapter.renderCv('demo-cv-1', { language: 'fr', includeBadges: [] }));
    expect(job.status).toBe('DONE');
    expect(job.resultUrl).toBe('/assets/mock/demo-cv.pdf');
    expect(job.targetType).toBe('CV');
    expect(job.targetId).toBe('demo-cv-1');
  });
});
