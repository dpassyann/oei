import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { DigitalBusinessCardApplicationService } from './digital-business-card-application.service';
import { DIGITAL_BUSINESS_CARD_PORT, DigitalBusinessCardPort } from '../../domain/port/wallet/digital-business-card.port';
import { createDigitalBusinessCard } from '../../domain/model/wallet/digital-business-card';

describe('DigitalBusinessCardApplicationService', () => {
  function setup(fakePort: DigitalBusinessCardPort) {
    TestBed.configureTestingModule({ providers: [{ provide: DIGITAL_BUSINESS_CARD_PORT, useValue: fakePort }] });
    return TestBed.inject(DigitalBusinessCardApplicationService);
  }

  it('givenPortReturnsCard_whenGenerateCard_thenForwardsIt', async () => {
    const expected = createDigitalBusinessCard({
      memberId: 'member-1',
      publicSlug: 'jane-dupont',
      qrCodeUrl: '/qr.svg',
      vCardUrl: '/card.vcf',
      theme: 'default',
    });
    const service = setup({ generateCard: () => of(expected) });
    const card = await firstValueFrom(service.generateCard());
    expect(card).toEqual(expected);
  });
});
