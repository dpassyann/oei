// Données de démonstration partagées par tous les `*-mock.adapter.ts` de l'espace membre
// institutionnel.
//
// IMPORTANT — isolation multi-tenant (mockée) :
// `docs/architecture/keycloak-roles.md` décrit l'isolation réelle comme portée par le groupe
// Keycloak `/institutions/{institutionId}` dans le JWT, résolu et appliqué côté backend
// Spring (futur) à chaque requête `/api/institution/v1/**`. Ce mock n'a ni JWT ni backend :
// il se contente de REFLÉTER l'intention en ne modélisant/exposant que les données d'UNE
// seule institution "courante" (`DEMO_INSTITUTION`, groupe `/institutions/demo-institution`
// dans `keycloak/realm-export/oei-realm.json`). `OTHER_INSTITUTION_MEMBERS_NEVER_EXPOSED`
// ci-dessous existe uniquement pour documenter par le test ce que l'isolation doit garantir
// une fois le vrai backend en place : aucun adapter de ce fichier ne le lit ni ne l'expose.
import { createInstitution, Institution } from '../../domain/model/institution/institution';
import { createInstitutionDomain } from '../../domain/model/institution/institution-domain';
import { createPartnership, Partnership } from '../../domain/model/institution/partnership';
import { createInstitutionMembership, InstitutionMembership } from '../../domain/model/institution/institution-membership';
import { createInstitutionInvitation, InstitutionInvitation } from '../../domain/model/institution/institution-invitation';
import {
  createMemberInstitutionAffiliation,
  MemberInstitutionAffiliation,
} from '../../domain/model/institution/member-institution-affiliation';
import { createInstitutionDashboard, InstitutionDashboard } from '../../domain/model/institution/institution-dashboard';
import { createInstitutionPublication, InstitutionPublication } from '../../domain/model/institution/institution-publication';
import { createInstitutionOpportunity, InstitutionOpportunity } from '../../domain/model/institution/institution-opportunity';
import { createInstitutionBadgeProposal, InstitutionBadgeProposal } from '../../domain/model/institution/institution-badge-proposal';
import { createInstitutionAuditLog, InstitutionAuditLog } from '../../domain/model/institution/institution-audit-log';

export const DEMO_INSTITUTION_ID = 'inst-demo-institution';

export const DEMO_INSTITUTION: Institution = createInstitution({
  id: DEMO_INSTITUTION_ID,
  legalName: 'OEI Démonstration SA',
  publicName: 'OEI Démonstration — Institution',
  logoUrl: '/img/institutions/demo-institution-logo.svg',
  country: 'CH',
  sectors: ['banking', 'consulting'],
  description:
    "Institution fictive de démonstration utilisée pour illustrer l'espace membre institutionnel. Ne correspond à aucun partenaire réel de l'OEI.",
  emailDomains: [
    createInstitutionDomain({ id: 'dom-demo-1', domain: 'oei-demo-institution.org', verified: true, verifiedAt: '2026-01-05T09:00:00Z' }),
  ],
  publicSlug: 'demo-institution',
  isDemoData: true,
});

export const DEMO_PARTNERSHIP: Partnership = createPartnership({
  institutionId: DEMO_INSTITUTION_ID,
  level: 'SILVER',
  verified: true,
  startedAt: '2026-01-05T09:00:00Z',
  endsAt: null,
  agreementDocumentUrl: null,
});

export const DEMO_MEMBERSHIPS: readonly InstitutionMembership[] = [
  createInstitutionMembership({
    memberId: 'member-owner-demo',
    institutionId: DEMO_INSTITUTION_ID,
    role: 'OWNER',
    grantedAt: '2026-01-05T09:00:00Z',
    grantedBy: 'member-owner-demo',
  }),
  createInstitutionMembership({
    memberId: 'member-admin-demo',
    institutionId: DEMO_INSTITUTION_ID,
    role: 'ADMIN',
    grantedAt: '2026-01-06T09:00:00Z',
    grantedBy: 'member-owner-demo',
  }),
  createInstitutionMembership({
    memberId: 'member-validator-demo',
    institutionId: DEMO_INSTITUTION_ID,
    role: 'AFFILIATION_VALIDATOR',
    grantedAt: '2026-01-07T09:00:00Z',
    grantedBy: 'member-owner-demo',
  }),
];

export const DEMO_INVITATIONS: readonly InstitutionInvitation[] = [
  createInstitutionInvitation({
    id: 'invitation-demo-1',
    institutionId: DEMO_INSTITUTION_ID,
    email: 'nouvelle.recrue@oei-demo-institution.org',
    role: 'CONTRIBUTOR',
    status: 'PENDING',
    invitedBy: 'member-admin-demo',
    invitedAt: '2026-02-01T09:00:00Z',
    expiresAt: '2026-02-15T09:00:00Z',
  }),
];

export const DEMO_AFFILIATIONS: readonly MemberInstitutionAffiliation[] = [
  createMemberInstitutionAffiliation({
    id: 'affiliation-demo-1',
    memberId: 'member-demo-1',
    memberDisplayName: 'Amélie Demo',
    institutionId: DEMO_INSTITUTION_ID,
    status: 'APPROVED',
    requestedAt: '2026-01-10T09:00:00Z',
    decidedAt: '2026-01-11T09:00:00Z',
    decidedBy: 'member-validator-demo',
    emailDomainVerified: true,
  }),
  createMemberInstitutionAffiliation({
    id: 'affiliation-demo-2',
    memberId: 'member-demo-2',
    memberDisplayName: 'Benoît Demo',
    institutionId: DEMO_INSTITUTION_ID,
    status: 'PENDING',
    requestedAt: '2026-02-01T09:00:00Z',
    decidedAt: null,
    decidedBy: null,
    emailDomainVerified: true,
  }),
];

export const DEMO_PUBLICATIONS: readonly InstitutionPublication[] = [
  createInstitutionPublication({
    id: 'institution-publication-demo-1',
    institutionId: DEMO_INSTITUTION_ID,
    type: 'EXPERIENCE_REPORT',
    title: 'Retour d’expérience : migration cloud (démonstration)',
    body: "Contenu de démonstration décrivant un retour d'expérience fictif.",
    status: 'PUBLISHED',
    authorMemberId: 'member-admin-demo',
    submittedAt: '2026-01-15T09:00:00Z',
    publishedAt: '2026-01-20T09:00:00Z',
  }),
  createInstitutionPublication({
    id: 'institution-publication-demo-2',
    institutionId: DEMO_INSTITUTION_ID,
    type: 'STUDY',
    title: 'Étude sur la gouvernance des données (démonstration)',
    body: 'Brouillon de démonstration en cours de rédaction.',
    status: 'DRAFT',
    authorMemberId: 'member-admin-demo',
    submittedAt: null,
    publishedAt: null,
  }),
];

export const DEMO_OPPORTUNITIES: readonly InstitutionOpportunity[] = [
  createInstitutionOpportunity({
    id: 'institution-opportunity-demo-1',
    institutionId: DEMO_INSTITUTION_ID,
    type: 'MENTORING',
    title: 'Programme de mentorat démonstration',
    description: 'Opportunité de démonstration proposant du mentorat à des membres affiliés.',
    status: 'PUBLISHED',
    expiresAt: '2026-06-30T00:00:00Z',
    publishedAt: '2026-02-01T09:00:00Z',
  }),
];

export const DEMO_BADGE_PROPOSALS: readonly InstitutionBadgeProposal[] = [
  createInstitutionBadgeProposal({
    id: 'institution-badge-proposal-demo-1',
    institutionId: DEMO_INSTITUTION_ID,
    memberId: 'member-demo-1',
    proposedBadgeCode: 'internal-mentoring-2026',
    justification: 'A encadré le programme de mentorat interne (démonstration).',
    status: 'PENDING',
  }),
];

export const DEMO_AUDIT_LOG: readonly InstitutionAuditLog[] = [
  createInstitutionAuditLog({
    id: 'institution-audit-demo-1',
    institutionId: DEMO_INSTITUTION_ID,
    actorId: 'member-validator-demo',
    action: 'AFFILIATION_APPROVED',
    targetType: 'MemberInstitutionAffiliation',
    targetId: 'affiliation-demo-1',
    occurredAt: '2026-01-11T09:00:00Z',
  }),
];

// Honnête, pas inventé : dérivé des tableaux ci-dessus, pas de chiffre en dur.
export const DEMO_DASHBOARD: InstitutionDashboard = createInstitutionDashboard({
  institutionId: DEMO_INSTITUTION_ID,
  affiliatedMembers: DEMO_AFFILIATIONS.filter((a) => a.status === 'APPROVED').length,
  activeMembers: DEMO_AFFILIATIONS.filter((a) => a.status === 'APPROVED').length,
  verifiedProfiles: 0,
  certifications: 0,
  badges: 0,
  signedCharters: 0,
  contributions: 0,
  trainings: 0,
  opportunities: DEMO_OPPORTUNITIES.length,
  publications: DEMO_PUBLICATIONS.length,
  invitations: DEMO_INVITATIONS.length,
  dataMaturity: 'IN_PROGRESS',
});

// N'est JAMAIS lu par un adapter mock — sert uniquement de fixture de test pour prouver que
// l'isolation par institution est respectée (voir `institution-affiliations-mock.adapter.spec.ts`).
export const OTHER_INSTITUTION_MEMBERS_NEVER_EXPOSED: readonly MemberInstitutionAffiliation[] = [
  createMemberInstitutionAffiliation({
    id: 'affiliation-other-institution-1',
    memberId: 'member-other-institution-1',
    memberDisplayName: 'Ne doit jamais apparaître ici',
    institutionId: 'inst-other-institution',
    status: 'APPROVED',
    requestedAt: '2026-01-01T00:00:00Z',
    decidedAt: '2026-01-02T00:00:00Z',
    decidedBy: 'member-other-validator',
    emailDomainVerified: true,
  }),
];
