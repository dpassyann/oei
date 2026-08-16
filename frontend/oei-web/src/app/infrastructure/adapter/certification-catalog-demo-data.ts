// Shared, mutable in-memory catalog of `RecognizedCertification` demo data, read by
// `CertificationMockAdapter` (public `/certifications` catalog + auto-validation lookup) and
// mutated by `AdminCertificationCatalogMockAdapter` (`/admin/certifications` CRUD). Extracted out
// of `certification-mock.adapter.ts` into its own module — like `institution-demo-data.ts` for the
// institution mocks — specifically so that a certification added or edited from the admin console
// mock immediately shows up on the public catalog mock, without wiring a second round-trip: both
// adapters are separate `@Service()` singletons, but a shared module-level array is the same
// object for both.
//
// Catalog data (name/organization/domain/competencies/description) is honest demo content, plain
// strings rather than i18n keys — same rule `RecognizedCertification`'s own doc comment states.
// No `/certifications/{slug}` associated-path page exists yet for any of these entries, so
// `associatedPathRoute` stays `null` everywhere.
import { RecognizedCertification, createRecognizedCertification } from '../../domain/model/certification/recognized-certification';

function buildSeedRecognizedCertifications(): RecognizedCertification[] {
  return [
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
}

let recognizedCertifications: RecognizedCertification[] = buildSeedRecognizedCertifications();

export function listRecognizedCertificationsCatalog(): readonly RecognizedCertification[] {
  return recognizedCertifications;
}

export function findRecognizedCertificationInCatalog(id: string): RecognizedCertification | undefined {
  return recognizedCertifications.find((candidate) => candidate.id === id);
}

export function addRecognizedCertificationToCatalog(certification: RecognizedCertification): void {
  recognizedCertifications = [...recognizedCertifications, certification];
}

export function updateRecognizedCertificationInCatalog(id: string, updated: RecognizedCertification): void {
  recognizedCertifications = recognizedCertifications.map((candidate) => (candidate.id === id ? updated : candidate));
}

/** Test-only reset so specs never leak mutations (additions/edits) from one test into the next. */
export function resetRecognizedCertificationsCatalogFixtures(): void {
  recognizedCertifications = buildSeedRecognizedCertifications();
}
