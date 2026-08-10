import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MemberCertificationGoalPort } from '../../domain/port/certification/member-certification-goal.port';
import { MemberCertificationGoal, MemberCertificationGoalUpsert } from '../../domain/model/certification/member-certification-goal';

// Role-versioned endpoint per ADR 0002, same literal-prefix convention as
// `certification-api.adapter.ts`'s `CERTIFICATION_API_BASE`.
const CERTIFICATION_GOAL_API_BASE = '/api/member/v1/certification-goals';

@Service()
export class MemberCertificationGoalApiAdapter implements MemberCertificationGoalPort {
  private readonly http = inject(HttpClient);

  listMyCertificationGoals(): Observable<MemberCertificationGoal[]> {
    return this.http.get<MemberCertificationGoal[]>(CERTIFICATION_GOAL_API_BASE);
  }

  upsertMyCertificationGoal(upsert: MemberCertificationGoalUpsert): Observable<MemberCertificationGoal> {
    return this.http.post<MemberCertificationGoal>(CERTIFICATION_GOAL_API_BASE, upsert);
  }
}
