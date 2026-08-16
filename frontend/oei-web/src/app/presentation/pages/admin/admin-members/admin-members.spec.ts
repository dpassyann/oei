import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminMembers } from './admin-members';
import { AdminMembersApplicationService } from '../../../../application/service/admin-members-application.service';
import { createAdminMemberSummary } from '../../../../domain/model/admin/admin-member';

describe('AdminMembers', () => {
  it('givenMembers_whenCreated_thenRendersOneRowPerMember', async () => {
    TestBed.configureTestingModule({
      imports: [AdminMembers],
      providers: [
        {
          provide: AdminMembersApplicationService,
          useValue: {
            list: () =>
              of([
                createAdminMemberSummary({
                  id: 'member-1',
                  displayName: 'Membre Un (exemple)',
                  email: 'membre.un@example.org',
                  country: 'CH',
                  duesStatus: 'PAID',
                  membershipStatus: 'ACTIVE',
                  lastPaymentAt: '2026-01-01T00:00:00Z',
                  suspendedReason: null,
                }),
              ]),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminMembers);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });

  it('givenSuspendedMember_whenCreated_thenShowsLiftSuspensionAction', async () => {
    TestBed.configureTestingModule({
      imports: [AdminMembers],
      providers: [
        {
          provide: AdminMembersApplicationService,
          useValue: {
            list: () =>
              of([
                createAdminMemberSummary({
                  id: 'member-2',
                  displayName: 'Membre Suspendu (exemple)',
                  email: 'membre.suspendu@example.org',
                  country: 'CH',
                  duesStatus: 'UNPAID',
                  membershipStatus: 'SUSPENDED',
                  lastPaymentAt: null,
                  suspendedReason: 'Abus signalé (exemple).',
                }),
              ]),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminMembers);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    expect(html).toContain('admin.members.actions.liftSuspension');
  });
});
