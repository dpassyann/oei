import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CertificationPort } from '../../domain/port/certification/certification.port';
import {
  Certification,
  CertificationDeclaration,
  createCertification,
} from '../../domain/model/certification/certification';
import { RecognizedCertification, createRecognizedCertification } from '../../domain/model/certification/recognized-certification';

// Same demonstration member as the rest of the mocked member space
// (see member-mock.adapter.ts DEMO_MEMBER) — never presented as a real account.
const DEMO_MEMBER_ID = 'demo-member-1';

// Catalog data (name/organization/domain/competencies) is honest demo content, plain strings
// rather than i18n keys — same rule `RecognizedCertification`'s own doc comment states, and the
// same treatment `Ressources`'s carousel already gives its own catalog entries. No
// `/certifications/{slug}` associated-path page exists yet for any of these entries, so
// `associatedPathRoute` stays `null` everywhere — the `/certifications` card CTA shows the
// disabled "à venir" state instead of inventing a link (see `certifications.ts`).
const RECOGNIZED_CERTIFICATIONS: RecognizedCertification[] = [
  createRecognizedCertification({
    id: 'rc-1',
    name: 'AWS Certified Solutions Architect',
    issuingOrganization: 'Amazon Web Services',
    autoValidate: true,
    domain: 'Cloud & infrastructure',
    level: 'ARCHITECT',
    language: 'en',
    oeiStatus: 'OEI_RECOGNIZED',
    competencies: ['Architecture cloud', 'Résilience et haute disponibilité', 'Sécurité des workloads cloud'],
    validityMonths: 36,
    associatedPathRoute: null,
  }),
  createRecognizedCertification({
    id: 'rc-2',
    name: 'PMP',
    issuingOrganization: 'PMI',
    autoValidate: false,
    domain: 'Gouvernance & management de projet',
    level: 'ENGINEER',
    language: 'en',
    oeiStatus: 'PARTNER_RECOGNIZED',
    competencies: ['Pilotage de projet', 'Gestion des risques', 'Gouvernance de portefeuille'],
    validityMonths: 36,
    associatedPathRoute: null,
  }),
  createRecognizedCertification({
    id: 'rc-3',
    name: 'Certified Information Systems Security Professional (CISSP)',
    issuingOrganization: 'ISC2',
    autoValidate: false,
    domain: 'Cybersécurité',
    level: 'EXPERT',
    language: 'en',
    oeiStatus: 'OEI_RECOGNIZED',
    competencies: ['Sécurité des systèmes d\'information', 'Gestion des risques cyber', 'Cryptographie'],
    validityMonths: 36,
    associatedPathRoute: null,
  }),
  createRecognizedCertification({
    id: 'rc-4',
    name: 'TensorFlow Developer Certificate',
    issuingOrganization: 'Google',
    autoValidate: false,
    domain: 'Intelligence artificielle',
    level: 'PRACTITIONER',
    language: 'en',
    oeiStatus: 'UNDER_REVIEW',
    competencies: ['Apprentissage automatique', 'Réseaux de neurones', 'Déploiement de modèles'],
    validityMonths: null,
    associatedPathRoute: null,
  }),
  createRecognizedCertification({
    id: 'rc-5',
    name: 'Certification Data Protection Officer (DPO)',
    issuingOrganization: 'CNIL',
    autoValidate: false,
    domain: 'Protection des données',
    level: 'ENGINEER',
    language: 'fr',
    oeiStatus: 'OEI_RECOGNIZED',
    competencies: ['RGPD', 'Analyse d\'impact', 'Conformité réglementaire'],
    validityMonths: 24,
    associatedPathRoute: null,
  }),
];

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
      ? RECOGNIZED_CERTIFICATIONS.find((candidate) => candidate.id === declaration.recognizedCertificationId)
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
    return of(RECOGNIZED_CERTIFICATIONS);
  }
}
