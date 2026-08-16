import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CertificationPort } from '../../domain/port/certification/certification.port';
import {
  Certification,
  CertificationDeclaration,
  createCertification,
} from '../../domain/model/certification/certification';
import { RecognizedCertification } from '../../domain/model/certification/recognized-certification';
import {
  findRecognizedCertificationInCatalog,
  listRecognizedCertificationsCatalog,
} from './certification-catalog-demo-data';

// Same demonstration member as the rest of the mocked member space
// (see member-mock.adapter.ts DEMO_MEMBER) — never presented as a real account.
const DEMO_MEMBER_ID = 'demo-member-1';

@Service()
export class CertificationMockAdapter implements CertificationPort {
  // In-memory mutable store, seeded with one demo certification — re-created per adapter
  // instance, no cross-instance persistence needed for the mock.
  private certifications: Certification[] = [
    createCertification({
      id: 'demo-cert-1',
      memberId: DEMO_MEMBER_ID,
      name: 'AWS Certified Solutions Architect',
      issuingOrganization: 'Amazon Web Services',
      status: 'VALIDATED',
      validatedBy: 'system-auto-validation',
      validatedAt: '2026-01-20T09:00:00Z',
    }),
  ];

  listCertifications(): Observable<Certification[]> {
    return of(this.certifications);
  }

  getCertification(id: string): Observable<Certification> {
    const certification = this.certifications.find((candidate) => candidate.id === id);
    if (!certification) {
      throw new Error(`Certification not found: ${id}`);
    }
    return of(certification);
  }

  declareCertification(declaration: CertificationDeclaration): Observable<Certification> {
    // Declaration → proof → recognized-catalog check → auto or manual validation, per the
    // spec workflow: a bare declaration is never auto-VALIDATED unless it matches a
    // recognized certification flagged `autoValidate: true`.
    const recognized = declaration.recognizedCertificationId
      ? findRecognizedCertificationInCatalog(declaration.recognizedCertificationId)
      : undefined;
    const autoValidated = recognized?.autoValidate === true;
    const now = new Date().toISOString();
    const certification = createCertification({
      ...declaration,
      id: crypto.randomUUID(),
      memberId: DEMO_MEMBER_ID,
      status: autoValidated ? 'VALIDATED' : 'DECLARED',
      validatedBy: autoValidated ? 'system-auto-validation' : undefined,
      validatedAt: autoValidated ? now : undefined,
    });
    this.certifications = [...this.certifications, certification];
    return of(certification);
  }

  listRecognizedCertifications(): Observable<RecognizedCertification[]> {
    return of([...listRecognizedCertificationsCatalog()]);
  }
}
