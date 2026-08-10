import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { MemberCertificationGoalApplicationService } from './member-certification-goal-application.service';
import {
  CERTIFICATION_GOAL_PORT,
  MemberCertificationGoalPort,
} from '../../domain/port/certification/member-certification-goal.port';
import { createMemberCertificationGoal } from '../../domain/model/certification/member-certification-goal';

describe('MemberCertificationGoalApplicationService', () => {
  function setup(fakePort: MemberCertificationGoalPort) {
    TestBed.configureTestingModule({ providers: [{ provide: CERTIFICATION_GOAL_PORT, useValue: fakePort }] });
    return TestBed.inject(MemberCertificationGoalApplicationService);
  }

  it('givenPortReturnsGoals_whenListMyCertificationGoals_thenReturnsThem', async () => {
    const expected = [
      createMemberCertificationGoal({
        id: 'goal-1',
        memberId: 'demo-member-1',
        recognizedCertificationId: 'rc-1',
        status: 'OBTAINED',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }),
    ];
    const service = setup({
      listMyCertificationGoals: () => of(expected),
      upsertMyCertificationGoal: () => {
        throw new Error('not used');
      },
    });
    const goals = await firstValueFrom(service.listMyCertificationGoals());
    expect(goals).toEqual(expected);
  });

  it('givenUpsert_whenUpsertMyCertificationGoal_thenForwardsItToThePortAndReturnsResult', async () => {
    const upsert = { recognizedCertificationId: 'rc-2', status: 'PLANNED' as const };
    const expected = createMemberCertificationGoal({
      id: 'goal-2',
      memberId: 'demo-member-1',
      recognizedCertificationId: 'rc-2',
      status: 'PLANNED',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    let received: unknown;
    const service = setup({
      listMyCertificationGoals: () => of([]),
      upsertMyCertificationGoal: (value) => {
        received = value;
        return of(expected);
      },
    });
    const goal = await firstValueFrom(service.upsertMyCertificationGoal(upsert));
    expect(received).toEqual(upsert);
    expect(goal).toEqual(expected);
  });
});
