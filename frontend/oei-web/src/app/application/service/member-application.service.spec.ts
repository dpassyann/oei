import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { MemberApplicationService } from './member-application.service';
import { MEMBER_PORT, MemberPort } from '../../domain/port/identity/member.port';
import { createMember } from '../../domain/model/identity/member';

describe('MemberApplicationService', () => {
  function setup(fakePort: MemberPort) {
    TestBed.configureTestingModule({ providers: [{ provide: MEMBER_PORT, useValue: fakePort }] });
    return TestBed.inject(MemberApplicationService);
  }

  it('givenPortReturnsMember_whenGetCurrentMember_thenForwardsIt', async () => {
    const expected = createMember({
      id: 'member-1',
      publicSlug: 'jane-dupont',
      displayName: 'Jane Dupont',
      locale: 'fr',
      country: 'FR',
      createdAt: '2026-01-01T00:00:00Z',
    });
    const service = setup({ getCurrentMember: () => of(expected) });
    const member = await firstValueFrom(service.getCurrentMember());
    expect(member).toEqual(expected);
  });
});
