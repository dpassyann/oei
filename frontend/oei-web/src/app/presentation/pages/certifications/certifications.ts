import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { I18nService } from '../../i18n/i18n.service';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { CertificationApplicationService } from '../../../application/service/certification-application.service';
import { MemberCertificationGoalApplicationService } from '../../../application/service/member-certification-goal-application.service';
import {
  CertificationLevel,
  CertificationOeiStatus,
  RecognizedCertification,
} from '../../../domain/model/certification/recognized-certification';
import { MemberCertificationGoalStatus } from '../../../domain/model/certification/member-certification-goal';

const LEVEL_COUNT = 6;

// Same order as the static level list above and as `certifications.levels.<index>` — lets a
// `CertificationLevel` enum value be shown with the exact same label/order as the rest of the
// page (see `levelLabel` below), rather than duplicating the 6 level names as fresh i18n keys.
const LEVEL_ORDER: readonly CertificationLevel[] = [
  'PRACTITIONER',
  'ENGINEER',
  'ARCHITECT',
  'EXPERT',
  'SENIOR_EXPERT',
  'FELLOW',
];

// The 3 member CTAs from the spec that record an explicit goal status. "Voir cette
// certification" only expands the card (handled separately by `toggleExpanded`) and, at most,
// records a `DISCOVER` goal — it never appears in this list.
const GOAL_CTA_STATUSES: readonly MemberCertificationGoalStatus[] = ['PLANNED', 'PREPARING', 'OBTAINED'];

const OEI_STATUS_OPTIONS: readonly CertificationOeiStatus[] = [
  'OEI_RECOGNIZED',
  'PARTNER_RECOGNIZED',
  'UNDER_REVIEW',
  'NOT_RECOGNIZED',
];

interface CertificationFilters {
  query: string;
  domain: string;
  level: string;
  organization: string;
  language: string;
  oeiStatus: string;
}

const EMPTY_FILTERS: CertificationFilters = {
  query: '',
  domain: '',
  level: '',
  organization: '',
  language: '',
  oeiStatus: '',
};

// Public `/certifications` page — enriched per "01-CERTIFICATIONS-AND-NEURAL-NETWORK-INTEGRATION.md"
// §"/certifications" (search/filters/cards/CTA "Voir le parcours associé"/member CTAs). The
// "Professional Neural Network" graph part of that same spec is explicitly out of scope here —
// nothing in this component builds or renders a relations graph.
//
// A certification NEVER automatically grants the OEI "Expert" level or any other expertise
// level (see the spec's own warning) — this page never derives one from the other; the level
// shown on a card is only the certification's own reference level, and a member's
// `MemberCertificationGoal` reaching `OBTAINED` still requires a separate governance decision
// before it could ever count towards an OEI expertise level.
@Component({
  selector: 'oei-certifications',
  imports: [FormsModule, RouterLink],
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class Certifications {
  protected readonly i18n = inject(I18nService);
  protected readonly keycloakAuth = inject(KeycloakAuthService);
  private readonly certificationService = inject(CertificationApplicationService);
  private readonly goalService = inject(MemberCertificationGoalApplicationService);

  // Only the index range is structural here: the 6 expertise-level labels
  // themselves come from `certifications.levels.<index>` (see home.ts's
  // `commitmentIndexes` for the same pattern).
  protected readonly levelIndexes = Array.from({ length: LEVEL_COUNT }, (_, i) => i);

  protected readonly isConnected = computed(() => this.keycloakAuth.isAuthenticated());

  private readonly catalogResource = rxResource({ stream: () => this.certificationService.listRecognizedCertifications() });
  protected readonly isLoading = computed(() => this.catalogResource.isLoading());
  private readonly catalog = computed<RecognizedCertification[]>(() => this.catalogResource.value() ?? []);

  private readonly goalsResource = rxResource({
    params: () => (this.isConnected() ? true : undefined),
    stream: () => this.goalService.listMyCertificationGoals(),
  });
  private readonly goals = computed(() => this.goalsResource.value() ?? []);

  protected readonly filters = signal<CertificationFilters>({ ...EMPTY_FILTERS });

  // Filter option lists are derived from the catalog itself rather than a fixed enum, so the
  // dropdowns never offer a domain/organization/language with zero matching results.
  protected readonly domainOptions = computed(() => this.distinctValues((entry) => entry.domain));
  protected readonly organizationOptions = computed(() => this.distinctValues((entry) => entry.issuingOrganization));
  protected readonly languageOptions = computed(() => this.distinctValues((entry) => entry.language));

  protected readonly filteredCertifications = computed<RecognizedCertification[]>(() => {
    const { query, domain, level, organization, language, oeiStatus } = this.filters();
    const normalizedQuery = query.trim().toLowerCase();
    return this.catalog().filter((entry) => {
      if (domain && entry.domain !== domain) return false;
      if (level && entry.level !== level) return false;
      if (organization && entry.issuingOrganization !== organization) return false;
      if (language && entry.language !== language) return false;
      if (oeiStatus && entry.oeiStatus !== oeiStatus) return false;
      if (!normalizedQuery) return true;
      const haystack = [entry.name, entry.issuingOrganization, entry.domain, ...(entry.competencies ?? [])]
        .filter((value): value is string => !!value)
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  });

  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly pendingUpsertIds = signal<ReadonlySet<string>>(new Set());

  protected readonly goalCtaStatuses = GOAL_CTA_STATUSES;
  protected readonly oeiStatusOptions = OEI_STATUS_OPTIONS;

  protected levelCodeAt(index: number): CertificationLevel {
    return LEVEL_ORDER[index];
  }

  protected updateQuery(value: string): void {
    this.filters.update((current) => ({ ...current, query: value }));
  }

  protected updateFilter(key: keyof CertificationFilters, value: string): void {
    this.filters.update((current) => ({ ...current, [key]: value }));
  }

  protected resetFilters(): void {
    this.filters.set({ ...EMPTY_FILTERS });
  }

  protected levelLabel(level: CertificationLevel | undefined): string | undefined {
    if (!level) return undefined;
    const index = LEVEL_ORDER.indexOf(level);
    return index >= 0 ? this.i18n.translate(`certifications.levels.${index}`) : undefined;
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleExpanded(certification: RecognizedCertification): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(certification.id)) {
        next.delete(certification.id);
      } else {
        next.add(certification.id);
      }
      return next;
    });
    // "Voir cette certification" also records first discovery of the catalog entry, unless the
    // member already has a further-along goal for it (never regress PLANNED/PREPARING/OBTAINED
    // back down to DISCOVER).
    if (this.isConnected() && !this.myGoalStatus(certification.id)) {
      this.upsertGoal(certification, 'DISCOVER');
    }
  }

  protected myGoalStatus(recognizedCertificationId: string): MemberCertificationGoalStatus | undefined {
    return this.goals().find((goal) => goal.recognizedCertificationId === recognizedCertificationId)?.status;
  }

  protected isPendingUpsert(id: string): boolean {
    return this.pendingUpsertIds().has(id);
  }

  protected setGoalStatus(certification: RecognizedCertification, status: MemberCertificationGoalStatus): void {
    this.upsertGoal(certification, status);
  }

  private upsertGoal(certification: RecognizedCertification, status: MemberCertificationGoalStatus): void {
    if (this.isPendingUpsert(certification.id)) {
      return;
    }
    this.pendingUpsertIds.update((current) => new Set(current).add(certification.id));
    this.goalService.upsertMyCertificationGoal({ recognizedCertificationId: certification.id, status }).subscribe({
      next: () => {
        this.pendingUpsertIds.update((current) => {
          const next = new Set(current);
          next.delete(certification.id);
          return next;
        });
        this.goalsResource.reload();
      },
      error: () => {
        this.pendingUpsertIds.update((current) => {
          const next = new Set(current);
          next.delete(certification.id);
          return next;
        });
      },
    });
  }

  private distinctValues(pick: (entry: RecognizedCertification) => string | undefined): string[] {
    const values = new Set<string>();
    for (const entry of this.catalog()) {
      const value = pick(entry);
      if (value) {
        values.add(value);
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }
}
