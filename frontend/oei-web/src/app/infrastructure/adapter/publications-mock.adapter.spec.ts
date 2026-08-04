import { firstValueFrom } from 'rxjs';
import { PublicationsMockAdapter } from './publications-mock.adapter';

describe('PublicationsMockAdapter', () => {
  it('givenNoRealPublicationsYet_whenGetPublications_thenReturnsEmptyArray', async () => {
    const adapter = new PublicationsMockAdapter();
    const publications = await firstValueFrom(adapter.getPublications('fr'));
    expect(publications).toEqual([]);
  });
});
