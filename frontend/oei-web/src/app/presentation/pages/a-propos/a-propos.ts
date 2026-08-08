import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MarkdownDocumentApplicationService } from '../../../application/service/markdown-document-application.service';
import {
  extractHeadings,
  MarkdownRenderService,
  stripFrontmatter,
} from '../../../application/service/markdown-render.service';
import { I18nService } from '../../i18n/i18n.service';
import {
  FloatingSideMenu,
  FloatingSideMenuLink,
} from '../../components/floating-side-menu/floating-side-menu';

// Source paths relative to a `content/<lang>/` folder — see `content/fr/000-VISION/` (only
// `fr` has real files today, the other languages only have `.gitkeep` placeholders, hence the
// repli-FR handled by `MarkdownAssetAdapter`, exactly like the Livre Blanc page).
const VISION_MISSION_PATH = '000-VISION/vision-mission.md';
const POURQUOI_UN_ORDRE_PATH = '000-VISION/pourquoi-un-ordre.md';

@Component({
  selector: 'oei-a-propos',
  imports: [FloatingSideMenu],
  templateUrl: './a-propos.html',
  styleUrl: './a-propos.scss',
})
export class APropos {
  private readonly markdownDocuments = inject(MarkdownDocumentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);

  // Two documents fetched independently (same `rxResource` pattern as `livre-blanc.ts`, just
  // instantiated twice) rather than one combined file: `vision-mission.md` and
  // `pourquoi-un-ordre.md` are two separate, independently-authored editorial pieces in
  // `content/fr/000-VISION/`, and keeping them as two fetches means either one can gain its own
  // translation later without touching the other.
  private readonly visionMissionResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(VISION_MISSION_PATH, params),
  });
  private readonly pourquoiUnOrdreResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) =>
      this.markdownDocuments.getMarkdownDocument(POURQUOI_UN_ORDRE_PATH, params),
  });

  protected readonly loading = computed(
    () => this.visionMissionResource.isLoading() || this.pourquoiUnOrdreResource.isLoading(),
  );
  protected readonly notFound = computed(
    () =>
      this.visionMissionResource.error() !== undefined ||
      this.pourquoiUnOrdreResource.error() !== undefined,
  );
  protected readonly isFallback = computed(
    () =>
      (this.visionMissionResource.value()?.isFallback ?? false) ||
      (this.pourquoiUnOrdreResource.value()?.isFallback ?? false),
  );

  private readonly visionMissionMarkdown = computed(() =>
    stripFrontmatter(this.visionMissionResource.value()?.body ?? ''),
  );
  private readonly pourquoiUnOrdreMarkdown = computed(() =>
    stripFrontmatter(this.pourquoiUnOrdreResource.value()?.body ?? ''),
  );

  protected readonly visionMissionHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(this.visionMissionMarkdown(), {
      headingIds: true,
    }),
  );
  protected readonly pourquoiUnOrdreHtml = computed(() =>
    this.markdownRender.renderTrustedToSafeHtml(this.pourquoiUnOrdreMarkdown(), {
      headingIds: true,
    }),
  );

  // Side menu combines both documents' own top-level headings, but at *different* Markdown
  // levels: `vision-mission.md` structures itself with `##` (Vision / Mission / Nos valeurs /
  // Ce que nous ne sommes pas), while `pourquoi-un-ordre.md` has no `##` at all — its FAQ-style
  // questions sit directly under its own `#` title as `###`. Scanning both at a single shared
  // depth (e.g. `[2]` only) would leave the second document contributing nothing to the menu, so
  // each source is scanned at its own top level instead.
  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() => [
    ...extractHeadings(this.visionMissionMarkdown(), [2]).map((heading) => ({
      label: heading.text,
      fragment: heading.slug,
    })),
    ...extractHeadings(this.pourquoiUnOrdreMarkdown(), [3]).map((heading) => ({
      label: heading.text,
      fragment: heading.slug,
    })),
  ]);
}
