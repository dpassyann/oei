import { TestBed } from '@angular/core/testing';
import { PartnerApplicationService } from './partner-application.service';
import { PARTNER_REPOSITORY_PORT, PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner } from '../../domain/model/partner';

describe('PartnerApplicationService', () => {
  function setup(fakePort?: PartnerRepositoryPort) {
    const port: PartnerRepositoryPort = fakePort ?? {
      getPartners: () =>
        Promise.resolve([
          createPartner({
            id: 'p1',
            name: 'Partner One',
            logoUrl: 'logo.png',
            description: 'Desc',
            websiteUrl: 'https://partner.example',
            category: 'ngo',
          }),
        ]),
      getPartner: (id) =>
        Promise.resolve(
          createPartner({
            id,
            name: 'Partner One',
            logoUrl: 'logo.png',
            description: 'Desc',
            websiteUrl: 'https://partner.example',
            category: 'ngo',
          }),
        ),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PARTNER_REPOSITORY_PORT, useValue: port }],
    });
    return TestBed.inject(PartnerApplicationService);
  }

  it('givenPortReturnsPartners_whenGetPartners_thenForwardsLangAndReturnsThem', async () => {
    let receivedLang: string | undefined;
    const service = setup({
      getPartners: (lang) => {
        receivedLang = lang;
        return Promise.resolve([
          createPartner({
            id: 'p1',
            name: 'Partner One',
            logoUrl: 'logo.png',
            description: 'Desc',
            websiteUrl: 'https://partner.example',
            category: 'ngo',
          }),
        ]);
      },
      getPartner: (id) =>
        Promise.resolve(
          createPartner({
            id,
            name: 'Partner One',
            logoUrl: 'logo.png',
            description: 'Desc',
            websiteUrl: 'https://partner.example',
            category: 'ngo',
          }),
        ),
    });
    const partners = await service.getPartners('fr');
    expect(receivedLang).toBe('fr');
    expect(partners).toEqual([
      createPartner({
        id: 'p1',
        name: 'Partner One',
        logoUrl: 'logo.png',
        description: 'Desc',
        websiteUrl: 'https://partner.example',
        category: 'ngo',
      }),
    ]);
  });

  it('givenPortReturnsPartner_whenGetPartner_thenForwardsIdAndLangAndReturnsIt', async () => {
    let receivedId: string | undefined;
    let receivedLang: string | undefined;
    const service = setup({
      getPartners: () => Promise.resolve([]),
      getPartner: (id, lang) => {
        receivedId = id;
        receivedLang = lang;
        return Promise.resolve(
          createPartner({
            id,
            name: 'Partner One',
            logoUrl: 'logo.png',
            description: 'Desc',
            websiteUrl: 'https://partner.example',
            category: 'ngo',
          }),
        );
      },
    });
    const partner = await service.getPartner('p1', 'fr');
    expect(receivedId).toBe('p1');
    expect(receivedLang).toBe('fr');
    expect(partner.id).toBe('p1');
  });
});
