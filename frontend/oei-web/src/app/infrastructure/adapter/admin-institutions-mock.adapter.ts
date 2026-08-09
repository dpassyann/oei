import { Service } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import { AdminInstitutionCreationInput, AdminInstitutionsPort } from '../../domain/port/admin/admin-institutions.port';
import { createInstitution, Institution } from '../../domain/model/institution/institution';
import { createInstitutionDomain } from '../../domain/model/institution/institution-domain';
import {
  activate as workflowActivate,
  approve as workflowApprove,
  revoke as workflowRevoke,
  suspend as workflowSuspend,
} from '../../domain/model/institution/institution-workflow';
import { DEMO_INSTITUTION } from './institution-demo-data';

function buildSeedInstitutions(): Institution[] {
  return [
    // The existing demo institution, now additionally carrying an admin workflow status —
    // treated as already ACTIVE since it's used throughout the institutional member space.
    createInstitution({ ...DEMO_INSTITUTION, status: 'ACTIVE' }),
    createInstitution({
      id: 'inst-onboarding-example',
      legalName: 'Exemple Consulting SA (démonstration)',
      publicName: 'Exemple Consulting',
      logoUrl: '/img/institutions/demo-institution-logo.svg',
      country: 'FR',
      sectors: ['consulting'],
      description: "Institution fictive illustrant le début du parcours d'onboarding admin.",
      emailDomains: [createInstitutionDomain({ id: 'dom-exemple-1', domain: 'exemple-consulting.example', verified: false, verifiedAt: null })],
      publicSlug: 'exemple-consulting',
      isDemoData: true,
      status: 'DOCUMENTS_PENDING',
    }),
  ];
}

let institutions: Institution[] = buildSeedInstitutions();

export function resetAdminInstitutionsFixtures(): void {
  institutions = buildSeedInstitutions();
}

function findOrThrow(id: string): Institution {
  const found = institutions.find((institution) => institution.id === id);
  if (!found) {
    throw new Error(`Institution "${id}" not found.`);
  }
  return found;
}

function replace(id: string, updated: Institution): void {
  institutions = institutions.map((institution) => (institution.id === id ? updated : institution));
}

@Service()
export class AdminInstitutionsMockAdapter implements AdminInstitutionsPort {
  list(): Observable<Institution[]> {
    return of([...institutions]);
  }

  getById(id: string): Observable<Institution> {
    const found = institutions.find((institution) => institution.id === id);
    return found ? of(found) : throwError(() => new Error(`Institution "${id}" not found.`));
  }

  create(input: AdminInstitutionCreationInput): Observable<Institution> {
    const id = `inst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const created = createInstitution({
      id,
      legalName: input.legalName,
      publicName: input.publicName,
      logoUrl: input.logoUrl ?? '',
      country: input.country,
      sectors: [input.type].filter((value): value is string => !!value),
      description: input.description ?? '',
      emailDomains: input.emailDomains.map((domain, index) =>
        createInstitutionDomain({ id: `dom-${id}-${index}`, domain, verified: false, verifiedAt: null }),
      ),
      publicSlug: input.publicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      isDemoData: true,
      status: 'DRAFT',
    });
    institutions = [...institutions, created];
    return of(created);
  }

  approve(id: string): Observable<Institution> {
    return this.transition(id, (institution) => workflowApprove(institution.status ?? 'DRAFT').status);
  }

  /**
   * Pure status transition only (APPROVED -> ACTIVE). Real activation should trigger, on a real
   * Spring Boot backend: (1) persist the institution in PostgreSQL, (2) call the Keycloak Admin
   * API to create the institutional admin user, (3) send the activation email, (4) assign the
   * institutional realm role, (5) associate `institutionId` with that Keycloak user, (6) force a
   * password change on first login, (7) journal the whole chain to the audit log — see
   * `.prompt/plan/final/02-PARTNERS-AND-INSTITUTION-ADMIN.md` §Provisioning Keycloak. None of that
   * chain is implemented here or anywhere in this frontend: this mock only simulates the state
   * transition itself, exactly as `activateInstitution`'s OpenAPI doc comment states this is a
   * future integration point.
   */
  activate(id: string): Observable<Institution> {
    return this.transition(id, (institution) => workflowActivate(institution.status ?? 'APPROVED').status);
  }

  suspend(id: string): Observable<Institution> {
    return this.transition(id, (institution) => workflowSuspend(institution.status ?? 'ACTIVE').status);
  }

  revoke(id: string, reason: string): Observable<Institution> {
    return this.transition(id, (institution) => workflowRevoke(institution.status ?? 'ACTIVE', reason).status);
  }

  private transition(id: string, computeNextStatus: (institution: Institution) => Institution['status']): Observable<Institution> {
    return of(id).pipe(
      map(() => {
        const institution = findOrThrow(id);
        const updated = createInstitution({ ...institution, status: computeNextStatus(institution) });
        replace(id, updated);
        return updated;
      }),
    );
  }
}
