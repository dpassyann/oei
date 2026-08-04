import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionAffiliationsPort } from '../../domain/port/institution/institution-affiliations.port';
import {
  createMemberInstitutionAffiliation,
  MemberInstitutionAffiliation,
} from '../../domain/model/institution/member-institution-affiliation';
import { DEMO_AFFILIATIONS } from './institution-demo-data';

// Isolation multi-tenant mockée : `this.affiliations` ne contient QUE les affiliations de
// l'institution de démonstration courante — jamais celles d'une autre institution (voir
// `OTHER_INSTITUTION_MEMBERS_NEVER_EXPOSED` dans `institution-demo-data.ts`, qui n'est
// délibérément importé nulle part ici). L'application réelle et stricte de cette isolation
// (résolution de l'institution depuis le token, filtrage systématique) reviendra au futur
// backend Spring — voir docs/architecture/keycloak-roles.md.
@Service()
export class InstitutionAffiliationsMockAdapter implements InstitutionAffiliationsPort {
  private affiliations: MemberInstitutionAffiliation[] = [...DEMO_AFFILIATIONS];

  listMembers(): Observable<MemberInstitutionAffiliation[]> {
    return of(this.affiliations.filter((affiliation) => affiliation.status === 'APPROVED'));
  }

  listAffiliationRequests(): Observable<MemberInstitutionAffiliation[]> {
    return of(this.affiliations);
  }

  approveAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.decide(id, 'APPROVED');
  }

  rejectAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.decide(id, 'REJECTED');
  }

  endAffiliation(id: string): Observable<void> {
    const existing = this.affiliations.find((affiliation) => affiliation.id === id);
    if (!existing) {
      return throwError(() => new Error(`Affiliation not found: ${id}`));
    }
    const ended = createMemberInstitutionAffiliation({ ...existing, status: 'ENDED', decidedAt: new Date().toISOString() });
    this.affiliations = this.affiliations.map((affiliation) => (affiliation.id === id ? ended : affiliation));
    return of(undefined);
  }

  private decide(id: string, status: 'APPROVED' | 'REJECTED'): Observable<MemberInstitutionAffiliation> {
    const existing = this.affiliations.find((affiliation) => affiliation.id === id);
    if (!existing) {
      return throwError(() => new Error(`Affiliation not found: ${id}`));
    }
    const decided = createMemberInstitutionAffiliation({
      ...existing,
      status,
      decidedAt: new Date().toISOString(),
      decidedBy: 'member-validator-demo',
    });
    this.affiliations = this.affiliations.map((affiliation) => (affiliation.id === id ? decided : affiliation));
    return of(decided);
  }
}
