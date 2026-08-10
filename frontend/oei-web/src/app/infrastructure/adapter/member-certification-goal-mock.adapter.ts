import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MemberCertificationGoalPort } from '../../domain/port/certification/member-certification-goal.port';
import {
  createMemberCertificationGoal,
  MemberCertificationGoal,
  MemberCertificationGoalUpsert,
} from '../../domain/model/certification/member-certification-goal';

// Same demonstration member as the rest of the mocked member space (see
// member-mock.adapter.ts DEMO_MEMBER / certification-mock.adapter.ts DEMO_MEMBER_ID) —
// never presented as a real account.
const DEMO_MEMBER_ID = 'demo-member-1';

@Service()
export class MemberCertificationGoalMockAdapter implements MemberCertificationGoalPort {
  // In-memory store, one entry per `recognizedCertificationId`, re-created per adapter
  // instance — no cross-instance persistence needed for the mock.
  private goals: MemberCertificationGoal[] = [
    createMemberCertificationGoal({
      id: 'goal-1',
      memberId: DEMO_MEMBER_ID,
      recognizedCertificationId: 'rc-1',
      status: 'OBTAINED',
      createdAt: '2026-02-01T09:00:00Z',
      updatedAt: '2026-02-01T09:00:00Z',
    }),
  ];

  listMyCertificationGoals(): Observable<MemberCertificationGoal[]> {
    return of(this.goals);
  }

  upsertMyCertificationGoal(upsert: MemberCertificationGoalUpsert): Observable<MemberCertificationGoal> {
    const now = new Date().toISOString();
    const existing = this.goals.find(
      (goal) => goal.recognizedCertificationId === upsert.recognizedCertificationId,
    );
    const updated = createMemberCertificationGoal({
      id: existing?.id ?? crypto.randomUUID(),
      memberId: DEMO_MEMBER_ID,
      recognizedCertificationId: upsert.recognizedCertificationId,
      status: upsert.status,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    this.goals = existing
      ? this.goals.map((goal) => (goal.id === updated.id ? updated : goal))
      : [...this.goals, updated];
    return of(updated);
  }
}
