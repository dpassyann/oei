import { Service } from '@angular/core';
import { map, Observable, of, throwError } from 'rxjs';
import {
  AdminContentPort,
  ContentApprovalInput,
  ContentCreationInput,
  ContentVersionCreationInput,
  ContentTranslationInput,
  AdminContentSearchCriteria,
} from '../../domain/port/cms/admin-content.port';
import {
  approve as workflowApprove,
  archive as workflowArchive,
  publish as workflowPublish,
  reject as workflowReject,
  requestTranslation as workflowRequestTranslation,
  schedule as workflowSchedule,
  submit as workflowSubmit,
} from '../../domain/model/cms/content-workflow';
import {
  Content,
  ContentApproval,
  ContentPublication,
  ContentTranslation,
  ContentVersion,
  createContent,
  createContentApproval,
  createContentPublication,
  createContentTranslation,
  createContentVersion,
} from '../../domain/model/cms/content.model';

// Demonstration data honestly reflecting the CMS pipeline at 3 different workflow stages plus one
// published normative document (see task brief point 8: "2-3 contenus éditoriaux d'exemple à
// différents statuts de workflow"). None of this is real OEI content — every title/body below is
// clearly a placeholder, consistent with the project's demo-data honesty rule.
//
// Built via factory functions (not plain array literals) so `resetAdminContentFixtures()` can
// restore genuinely pristine state between tests, rather than re-freezing whatever the mutated
// arrays currently hold.
function buildSeedContents(): Content[] {
  return [
  createContent({
    id: 'content-livre-blanc',
    type: 'WHITEPAPER',
    slug: 'livre-blanc',
    sourceType: 'GIT',
    title: 'Livre Blanc',
    tags: ['gouvernance', 'référence'],
    governance: { approvalRequired: true, decisionId: 'DEC-2026-001' },
    currentVersionId: 'version-livre-blanc-1',
    status: 'PUBLISHED',
  }),
  createContent({
    id: 'content-reglement-interieur',
    type: 'REGULATION',
    slug: 'reglement-interieur',
    sourceType: 'GIT',
    title: 'Règlement intérieur (brouillon de mise à jour)',
    tags: ['règlement', 'normatif'],
    governance: { approvalRequired: true, decisionId: null },
    currentVersionId: 'version-reglement-1',
    status: 'IN_REVIEW',
  }),
  createContent({
    id: 'content-charte-ethique',
    type: 'CHARTER',
    slug: 'charte-ethique-numerique',
    sourceType: 'GIT',
    title: 'Charte éthique du numérique (projet)',
    tags: ['éthique', 'charte'],
    governance: { approvalRequired: true, decisionId: null },
    currentVersionId: 'version-charte-1',
    status: 'GOVERNANCE_REVIEW',
  }),
  createContent({
    id: 'content-actu-lancement',
    type: 'NEWS',
    slug: 'lancement-plateforme-oei',
    sourceType: 'CMS',
    title: "Brouillon — Lancement de la plateforme OEI (exemple)",
    tags: ['actualité', 'lancement'],
    governance: { approvalRequired: false, decisionId: null },
    currentVersionId: 'version-actu-1',
    status: 'DRAFT',
  }),
  ];
}

function buildSeedVersions(): ContentVersion[] {
  return [
  createContentVersion({
    id: 'version-livre-blanc-1',
    contentId: 'content-livre-blanc',
    version: '1.0',
    language: 'fr',
    title: 'Livre Blanc',
    body: "# Livre Blanc\n\nSynthèse des positions de l'OEI. (Exemple mocké.)",
    authorIds: ['yann-deungoue'],
    status: 'PUBLISHED',
    createdAt: '2026-08-01T09:00:00Z',
  }),
  createContentVersion({
    id: 'version-reglement-1',
    contentId: 'content-reglement-interieur',
    version: '2.1-draft',
    language: 'fr',
    title: 'Règlement intérieur (brouillon de mise à jour)',
    body: '# Règlement intérieur\n\nArticle 1 — Objet. (Exemple mocké en cours de révision.)',
    authorIds: ['admin-demo'],
    status: 'IN_REVIEW',
    createdAt: '2026-07-15T10:00:00Z',
  }),
  createContentVersion({
    id: 'version-charte-1',
    contentId: 'content-charte-ethique',
    version: '0.3-draft',
    language: 'fr',
    title: 'Charte éthique du numérique (projet)',
    body: "# Charte éthique du numérique\n\nPréambule. (Exemple mocké, en revue de gouvernance.)",
    authorIds: ['admin-demo'],
    status: 'GOVERNANCE_REVIEW',
    createdAt: '2026-06-20T08:30:00Z',
  }),
  createContentVersion({
    id: 'version-actu-1',
    contentId: 'content-actu-lancement',
    version: '0.1-draft',
    language: 'fr',
    title: "Brouillon — Lancement de la plateforme OEI (exemple)",
    body: "# Lancement de la plateforme OEI\n\nContenu d'exemple non publié.",
    authorIds: ['admin-demo'],
    status: 'DRAFT',
    createdAt: '2026-07-28T14:00:00Z',
  }),
  ];
}

function buildSeedApprovals(): ContentApproval[] {
  return [
  createContentApproval({
    id: 'approval-charte-legal-1',
    contentVersionId: 'version-charte-1',
    role: 'LEGAL',
    decision: 'APPROVED',
    comment: 'Conforme sur le plan juridique (exemple).',
    approverId: 'admin-demo',
    decidedAt: '2026-07-10T09:00:00Z',
  }),
  ];
}

function buildSeedPublications(): ContentPublication[] {
  return [
  createContentPublication({
    id: 'publication-livre-blanc-1',
    contentVersionId: 'version-livre-blanc-1',
    publishedAt: '2026-08-01T09:00:00Z',
    publishedBy: 'admin-demo',
    channel: 'site-public',
  }),
  ];
}

function buildSeedTranslations(): ContentTranslation[] {
  return [
  createContentTranslation({
    id: 'translation-livre-blanc-en',
    contentVersionId: 'version-livre-blanc-1',
    language: 'en',
    status: 'PENDING',
    translatorId: null,
    validatedBy: null,
    validatedAt: null,
  }),
  ];
}

let seedContents: Content[] = buildSeedContents();
let seedVersions: ContentVersion[] = buildSeedVersions();
let seedApprovals: ContentApproval[] = buildSeedApprovals();
let seedPublications: ContentPublication[] = buildSeedPublications();
let seedTranslations: ContentTranslation[] = buildSeedTranslations();

function nowIso(): string {
  return new Date().toISOString();
}

function matchesCriteria(content: Content, version: ContentVersion | undefined, criteria?: AdminContentSearchCriteria): boolean {
  if (!criteria) return true;
  if (criteria.type && content.type !== criteria.type) return false;
  if (criteria.status && content.status !== criteria.status) return false;
  if (criteria.lang && version?.language !== criteria.lang) return false;
  if (criteria.tag && !content.tags.includes(criteria.tag)) return false;
  if (criteria.q) {
    const needle = criteria.q.toLowerCase();
    const haystack = `${content.title} ${version?.body ?? ''}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

// Test-only reset hook: this module holds mutable module-level state (a genuine in-memory mock
// "database") so that workflow transitions persist across calls within one app session, exactly
// like a real backend would. Specs import this to guarantee isolation between test cases by
// restoring genuinely pristine fixtures (not just re-freezing the current, possibly mutated, state).
export function resetAdminContentFixtures(): void {
  seedContents = buildSeedContents();
  seedVersions = buildSeedVersions();
  seedApprovals = buildSeedApprovals();
  seedPublications = buildSeedPublications();
  seedTranslations = buildSeedTranslations();
}

@Service()
export class AdminContentMockAdapter implements AdminContentPort {
  list(criteria?: AdminContentSearchCriteria): Observable<Content[]> {
    const results = seedContents.filter((content) =>
      matchesCriteria(
        content,
        seedVersions.find((version) => version.id === content.currentVersionId),
        criteria,
      ),
    );
    return of(results);
  }

  getById(id: string): Observable<Content> {
    const found = seedContents.find((content) => content.id === id);
    return found ? of(found) : throwError(() => new Error(`Content "${id}" not found.`));
  }

  getVersions(contentId: string): Observable<ContentVersion[]> {
    return of(seedVersions.filter((version) => version.contentId === contentId));
  }

  create(input: ContentCreationInput): Observable<Content> {
    const id = `content-${input.slug}`;
    const created = createContent({
      id,
      type: input.type,
      slug: input.slug,
      sourceType: input.sourceType,
      title: input.title,
      tags: input.tags ?? [],
      governance: { approvalRequired: input.governance?.approvalRequired ?? false, decisionId: input.governance?.decisionId ?? null },
      currentVersionId: null,
      status: 'DRAFT',
    });
    seedContents = [...seedContents, created];
    return of(created);
  }

  createVersion(contentId: string, input: ContentVersionCreationInput): Observable<ContentVersion> {
    return this.getById(contentId).pipe(
      map((content) => {
        const previousVersions = seedVersions.filter((version) => version.contentId === contentId);
        const nextVersionNumber = previousVersions.length + 1;
        const version = createContentVersion({
          id: `version-${contentId}-${nextVersionNumber}`,
          contentId,
          version: `${nextVersionNumber}.0-draft`,
          language: input.language,
          title: input.title,
          body: input.body,
          frontMatter: input.frontMatter,
          authorIds: ['admin-demo'],
          status: 'DRAFT',
          createdAt: nowIso(),
        });
        seedVersions = [...seedVersions, version];
        seedContents = seedContents.map((existing) =>
          existing.id === contentId ? createContent({ ...content, currentVersionId: version.id, status: 'DRAFT' }) : existing,
        );
        return version;
      }),
    );
  }

  submit(contentId: string): Observable<Content> {
    return this.transition(contentId, (content) => workflowSubmit(content.status, 'admin').status);
  }

  approve(contentId: string, input: ContentApprovalInput): Observable<ContentApproval> {
    return this.getById(contentId).pipe(
      map((content) => {
        const result = workflowApprove(content.status, 'admin', input.role, input.decision);
        seedContents = seedContents.map((existing) => (existing.id === contentId ? createContent({ ...content, status: result.status }) : existing));
        const approval = createContentApproval({
          id: `approval-${contentId}-${seedApprovals.length + 1}`,
          contentVersionId: content.currentVersionId ?? '',
          role: input.role,
          decision: input.decision,
          comment: input.comment ?? '',
          approverId: 'admin-demo',
          decidedAt: nowIso(),
        });
        seedApprovals = [...seedApprovals, approval];
        return approval;
      }),
    );
  }

  reject(contentId: string, comment: string): Observable<Content> {
    return this.transition(contentId, (content) => workflowReject(content.status, 'admin').status, comment);
  }

  requestTranslation(contentId: string): Observable<Content> {
    return this.transition(contentId, (content) => workflowRequestTranslation(content.status, 'admin').status);
  }

  schedule(contentId: string): Observable<Content> {
    return this.transition(contentId, (content) => workflowSchedule(content.status, 'admin').status);
  }

  publish(contentId: string): Observable<ContentPublication> {
    return this.getById(contentId).pipe(
      map((content) => {
        const result = workflowPublish(content.status, 'admin');
        seedContents = seedContents.map((existing) => (existing.id === contentId ? createContent({ ...content, status: result.status }) : existing));
        const publication = createContentPublication({
          id: `publication-${contentId}-${seedPublications.length + 1}`,
          contentVersionId: content.currentVersionId ?? '',
          publishedAt: nowIso(),
          publishedBy: 'admin-demo',
          channel: 'site-public',
        });
        seedPublications = [...seedPublications, publication];
        return publication;
      }),
    );
  }

  archive(contentId: string): Observable<Content> {
    return this.transition(contentId, (content) => workflowArchive(content.status, 'admin').status);
  }

  addTranslation(contentId: string, input: ContentTranslationInput): Observable<ContentTranslation> {
    return this.getById(contentId).pipe(
      map((content) => {
        const translation = createContentTranslation({
          id: `translation-${contentId}-${input.language}`,
          contentVersionId: content.currentVersionId ?? '',
          language: input.language,
          status: 'PENDING',
          translatorId: input.translatorId ?? null,
          validatedBy: null,
          validatedAt: null,
        });
        seedTranslations = [...seedTranslations.filter((t) => t.id !== translation.id), translation];
        return translation;
      }),
    );
  }

  validateTranslation(contentId: string, language: string): Observable<ContentTranslation> {
    const translation = seedTranslations.find((t) => t.contentVersionId === seedContents.find((c) => c.id === contentId)?.currentVersionId && t.language === language);
    if (!translation) {
      return throwError(() => new Error(`Translation for "${contentId}"/"${language}" not found.`));
    }
    const validated = createContentTranslation({ ...translation, status: 'VALIDATED', validatedBy: 'admin-demo', validatedAt: nowIso() });
    seedTranslations = seedTranslations.map((t) => (t.id === translation.id ? validated : t));
    return of(validated);
  }

  private transition(contentId: string, computeNextStatus: (content: Content) => Content['status'], _comment?: string): Observable<Content> {
    return this.getById(contentId).pipe(
      map((content) => {
        const nextStatus = computeNextStatus(content);
        const updated = createContent({ ...content, status: nextStatus });
        seedContents = seedContents.map((existing) => (existing.id === contentId ? updated : existing));
        return updated;
      }),
    );
  }
}
