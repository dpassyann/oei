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

  it('givenPortReturnsPartners_whenGetPartners_thenReturnsThem', async () => {
    const service = setup();
    const partners = await service.getPartners();
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

  it('givenPortReturnsPartner_whenGetPartner_thenForwardsIdAndReturnsIt', async () => {
    let receivedId: string | undefined;
    const service = setup({
      getPartners: () => Promise.resolve([]),
      getPartner: (id) => {
        receivedId = id;
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
    const partner = await service.getPartner('p1');
    expect(receivedId).toBe('p1');
    expect(partner.id).toBe('p1');
  });
});
