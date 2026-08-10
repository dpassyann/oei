import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberCertificationGoal, MemberCertificationGoalUpsert } from '../../model/certification/member-certification-goal';

export interface MemberCertificationGoalPort {
  listMyCertificationGoals(): Observable<MemberCertificationGoal[]>;
  upsertMyCertificationGoal(upsert: MemberCertificationGoalUpsert): Observable<MemberCertificationGoal>;
}

export const CERTIFICATION_GOAL_PORT = new InjectionToken<MemberCertificationGoalPort>('CertificationGoalPort');
