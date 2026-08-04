import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Member } from '../../model/identity/member';

export interface MemberPort {
  getCurrentMember(): Observable<Member>;
}

export const MEMBER_PORT = new InjectionToken<MemberPort>('MemberPort');
