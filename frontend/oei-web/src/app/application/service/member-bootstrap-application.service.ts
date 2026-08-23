import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberBootstrapPort } from '../../domain/port/profile/member-bootstrap.port';
import { MemberBootstrap } from '../../domain/model/profile/member-bootstrap';

/**
 * Application service for bootstrap state.
 *
 * Called once after authentication — uses the port so components never know
 * whether data comes from mock or HTTP.
 */
@Injectable({ providedIn: 'root' })
export class MemberBootstrapApplicationService {
  private readonly port = inject(MemberBootstrapPort);

  getBootstrap(): Observable<MemberBootstrap> {
    return this.port.getBootstrap();
  }
}

