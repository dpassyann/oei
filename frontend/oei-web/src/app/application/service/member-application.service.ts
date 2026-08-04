import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MEMBER_PORT } from '../../domain/port/identity/member.port';
import { Member } from '../../domain/model/identity/member';

@Service()
export class MemberApplicationService {
  private readonly port = inject(MEMBER_PORT);

  getCurrentMember(): Observable<Member> {
    return this.port.getCurrentMember();
  }
}
