import { firstValueFrom } from 'rxjs';
import { InstitutionPublicationsMockAdapter } from './institution-publications-mock.adapter';

describe('InstitutionPublicationsMockAdapter', () => {
  it('whenListPublications_thenReturnsDemoPublications', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    const publications = await firstValueFrom(adapter.listPublications());
    expect(publications.length).toBeGreaterThan(0);
  });

  it('whenCreatePublication_thenStartsInDraftStatus', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    const created = await firstValueFrom(adapter.createPublication({ type: 'REPORT', title: 'Nouveau rapport', body: 'Corps' }));
    expect(created.status).toBe('DRAFT');
  });

  it('givenDraftPublication_whenUpdatePublication_thenContentIsChanged', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    const updated = await firstValueFrom(
      adapter.updatePublication('institution-publication-demo-2', { type: 'STUDY', title: 'Titre modifié', body: 'Corps modifié' }),
    );
    expect(updated.title).toBe('Titre modifié');
  });

  it('givenPublishedPublication_whenUpdatePublication_thenThrows', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    await expect(
      firstValueFrom(adapter.updatePublication('institution-publication-demo-1', { type: 'REPORT', title: 'x', body: 'y' })),
    ).rejects.toThrow();
  });

  it('givenDraftPublication_whenSubmitPublication_thenStatusBecomesSubmitted', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    const submitted = await firstValueFrom(adapter.submitPublication('institution-publication-demo-2'));
    expect(submitted.status).toBe('SUBMITTED');
    expect(submitted.submittedAt).not.toBeNull();
  });

  it('givenUnknownPublication_whenGetPublication_thenThrows', async () => {
    const adapter = new InstitutionPublicationsMockAdapter();
    await expect(firstValueFrom(adapter.getPublication('unknown'))).rejects.toThrow();
  });
});
