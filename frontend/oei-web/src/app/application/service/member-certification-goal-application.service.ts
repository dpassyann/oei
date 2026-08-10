import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CERTIFICATION_GOAL_PORT } from '../../domain/port/certification/member-certification-goal.port';
import { MemberCertificationGoal, MemberCertificationGoalUpsert } from '../../domain/model/certification/member-certification-goal';

@Service()
export class MemberCertificationGoalApplicationService {
  private readonly port = inject(CERTIFICATION_GOAL_PORT);

  listMyCertificationGoals(): Observable<MemberCertificationGoal[]> {
    return this.port.listMyCertificationGoals();
  }

  upsertMyCertificationGoal(upsert: MemberCertificationGoalUpsert): Observable<MemberCertificationGoal> {
    return this.port.upsertMyCertificationGoal(upsert);
  }
}
