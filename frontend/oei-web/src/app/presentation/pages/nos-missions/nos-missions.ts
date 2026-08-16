import { Component, computed, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import {
  FloatingSideMenu,
  FloatingSideMenuLink,
} from '../../components/floating-side-menu/floating-side-menu';

// Static list of the developed sections below the original commitments list. Each entry maps a
// stable DOM anchor `id` (used by `FloatingSideMenu`'s `IntersectionObserver`, exactly like
// `a-propos.ts`/`deontologie.ts`) to the `nosMissions.sections.<key>` i18n subtree (`title` +
// `paragraphs`). Unlike `APropos`/`Deontologie`, this content is authored directly in the i18n
// JSON files rather than sourced from `content/<lang>/*.md`: it is short-form mission copy, not a
// long editorial document, and only `fr` has real Markdown today — going through i18n keeps all
// six languages translated up front (golden rule: no hardcoded text).
const MISSION_SECTIONS = [
  { id: 'reconnaissance-profession', key: 'recognition' },
  { id: 'standards-competence', key: 'standards' },
  { id: 'deontologie-commune', key: 'ethics' },
  { id: 'reseau-transparence', key: 'network' },
  { id: 'gouvernance-internationale', key: 'governance' },
] as const;

@Component({
  selector: 'oei-nos-missions',
  imports: [FloatingSideMenu],
  templateUrl: './nos-missions.html',
  styleUrl: './nos-missions.scss',
})
export class NosMissions {
  protected readonly i18n = inject(I18nService);

  // Exposed to the template so it can iterate sections without duplicating `MISSION_SECTIONS`.
  protected readonly sections = MISSION_SECTIONS;

  // Recomputed on every language switch (`i18n.currentLang` is a signal read inside `translate`),
  // same reactivity as `sideMenuLinks` in `a-propos.ts`.
  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    MISSION_SECTIONS.map((section) => ({
      label: this.i18n.translate(`nosMissions.sections.${section.key}.title`),
      fragment: section.id,
    })),
  );
}
