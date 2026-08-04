import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { CvApplicationService } from '../../../../application/service/cv-application.service';
import { MemberApplicationService } from '../../../../application/service/member-application.service';
import { I18nService } from '../../../i18n/i18n.service';
import { CV_SECTION_TYPES, Cv, CvSectionType, CvTranslationStatus, PdfGenerationJob } from '../../../../domain/model/cv/cv';
import { CvTemplate } from '../../../../domain/model/cv/cv-template';
import { MembershipAccessService } from '../../../auth/membership-access.service';

// This component's forms are single-purpose and flat (one select + one text input for
// "add section", one language code + one text input for "add translation"). Signal Forms
// (`form()` from `@angular/forms/signals`) exists in the installed Angular version (verified
// via `node_modules/@angular/forms/types/signals.d.ts`), but its `FieldTree` model adds
// indirection that isn't justified for forms this small with no cross-field validation —
// plain signals + manual checks are simpler to read and test here, consistent with how the
// rest of this repo (e.g. the Livre Blanc download form) still favors the simpler approach
// until there's a real need for schema-driven validation.
//
// Roadmap note (product request, NOT implemented here — mocked V1 scope only):
// - V2: offer printing and postal delivery of a premium cardstock physical copy of the CV.
// - V3: work-anniversary and retirement-related features (e.g. tenure milestones surfaced
//   from `Experience`/`Membership` history).
// These are intentionally out of scope for this plan; left as a pointer for whoever picks
// up the next iteration.
@Component({
  selector: 'oei-cv-builder',
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './cv-builder.html',
  styleUrl: './cv-builder.scss',
  // Component-scoped (not root-singleton) — see `MembershipAccessService`'s doc comment.
  providers: [MembershipAccessService],
})
export class CvBuilder {
  private readonly cvService = inject(CvApplicationService);
  private readonly memberService = inject(MemberApplicationService);
  protected readonly membershipAccess = inject(MembershipAccessService);
  protected readonly i18n = inject(I18nService);

  private readonly cvsResource = rxResource({
    stream: () => this.cvService.listCvs(),
  });

  private readonly templatesResource = rxResource({
    stream: () => this.cvService.listTemplates(),
  });

  private readonly memberResource = rxResource({
    stream: () => this.memberService.getCurrentMember(),
  });

  // V1 demo scope: the mock seeds exactly one CV (`demo-cv-1`) — a full multi-CV
  // switcher UI is out of scope, so we simply take the first CV in the list as "current".
  protected readonly cv = computed<Cv | undefined>(() => this.cvsResource.value()?.[0]);

  protected readonly memberDisplayName = computed(() => this.memberResource.value()?.displayName);

  protected readonly templates = computed<readonly CvTemplate[]>(() => this.templatesResource.value() ?? []);

  protected readonly templateName = computed(() => {
    const cv = this.cv();
    const templates = this.templatesResource.value() ?? [];
    const template = templates.find((candidate: CvTemplate) => candidate.id === cv?.templateId);
    return template?.name;
  });

  // "Live" template selection for the OEI-branded preview gallery: kept as a local signal
  // so the preview updates *instantly* on click (spec requirement — the preview must react
  // immediately, not only once the PDF is generated), independent of the round-trip needed
  // to actually persist the choice on the CV via `updateCv`. Falls back to the CV's current
  // `templateId` until the visitor picks something else.
  private readonly selectedTemplateIdOverride = signal<string | undefined>(undefined);

  protected readonly selectedTemplateId = computed(() => this.selectedTemplateIdOverride() ?? this.cv()?.templateId);

  protected readonly selectedTemplateCode = computed<string | undefined>(() => {
    const id = this.selectedTemplateId();
    return this.templates().find((template) => template.id === id)?.code;
  });

  protected readonly sortedSections = computed(() => {
    const cv = this.cv();
    return cv ? [...cv.sections].sort((a, b) => a.order - b.order) : [];
  });

  protected readonly availableSectionTypes = computed<readonly CvSectionType[]>(() => {
    const cv = this.cv();
    const usedTypes = new Set((cv?.sections ?? []).map((section) => section.type));
    return CV_SECTION_TYPES.filter((type) => !usedTypes.has(type));
  });

  protected readonly newSectionType = signal<CvSectionType | ''>('');
  protected readonly newSectionContent = signal('');

  // Per-section "add translation" mini-form input state, keyed by section id, so each
  // section panel keeps its own independent draft without needing a form-per-section
  // sub-component.
  protected readonly newTranslationLanguage = signal<Record<string, string>>({});
  protected readonly newTranslationContent = signal<Record<string, string>>({});

  protected readonly renderJob = signal<PdfGenerationJob | undefined>(undefined);
  protected readonly renderInProgress = signal(false);

  protected objectEntries(content: Readonly<Record<string, unknown>>): [string, unknown][] {
    return Object.entries(content);
  }

  // Short one-line excerpt of a section's content for the branded preview (which favors a
  // compact, diploma-like layout over the exhaustive key/value dump used in the editable
  // sections list further down the page).
  protected sectionPreviewText(content: Readonly<Record<string, unknown>>): string {
    const [firstValue] = Object.values(content);
    return typeof firstValue === 'string' ? firstValue : '';
  }

  protected translationLanguageFor(sectionId: string): string {
    return this.newTranslationLanguage()[sectionId] ?? '';
  }

  protected setTranslationLanguage(sectionId: string, value: string): void {
    this.newTranslationLanguage.update((state) => ({ ...state, [sectionId]: value }));
  }

  protected translationContentFor(sectionId: string): string {
    return this.newTranslationContent()[sectionId] ?? '';
  }

  protected setTranslationContent(sectionId: string, value: string): void {
    this.newTranslationContent.update((state) => ({ ...state, [sectionId]: value }));
  }

  protected isUnvalidated(status: CvTranslationStatus): boolean {
    return status !== 'VALIDATED';
  }

  protected isMachineGenerated(status: CvTranslationStatus): boolean {
    return status === 'MACHINE_GENERATED';
  }

  // Selecting a gallery thumbnail updates the live preview *instantly* (local signal) and
  // persists the choice on the CV in the background via `updateCv` — a failed/slow
  // persistence never blocks the immediate visual feedback the spec asks for.
  protected selectTemplate(templateId: string): void {
    // The instant live-preview update is allowed even read-only (it's not persisted below
    // when read-only) — only the `updateCv` persistence call is gated.
    this.selectedTemplateIdOverride.set(templateId);
    const cv = this.cv();
    if (!cv || cv.templateId === templateId || this.membershipAccess.isReadOnly()) {
      return;
    }
    this.cvService.updateCv(cv.id, { ...cv, templateId }).subscribe(() => this.cvsResource.reload());
  }

  protected addSection(): void {
    const cv = this.cv();
    const type = this.newSectionType();
    if (!cv || !type || this.membershipAccess.isReadOnly()) {
      return;
    }
    this.cvService
      .addSection(cv.id, {
        type,
        order: cv.sections.length,
        content: { text: this.newSectionContent() },
      })
      .subscribe(() => {
        this.newSectionType.set('');
        this.newSectionContent.set('');
        this.cvsResource.reload();
      });
  }

  protected validateTranslation(sectionId: string, language: string): void {
    const cv = this.cv();
    if (!cv || this.membershipAccess.isReadOnly()) {
      return;
    }
    this.cvService.validateTranslation(cv.id, sectionId, language).subscribe(() => {
      this.cvsResource.reload();
    });
  }

  protected addTranslation(sectionId: string): void {
    const cv = this.cv();
    const language = this.translationLanguageFor(sectionId);
    const text = this.translationContentFor(sectionId);
    if (!cv || !language || this.membershipAccess.isReadOnly()) {
      return;
    }
    this.cvService.addTranslation(cv.id, sectionId, { language, content: { text } }).subscribe(() => {
      this.setTranslationLanguage(sectionId, '');
      this.setTranslationContent(sectionId, '');
      this.cvsResource.reload();
    });
  }

  protected generatePdf(): void {
    const cv = this.cv();
    if (!cv) {
      return;
    }
    this.renderInProgress.set(true);
    this.cvService.renderCv(cv.id, { language: this.i18n.currentLang(), includeBadges: [] }).subscribe((job) => {
      this.renderJob.set(job);
      this.renderInProgress.set(false);
    });
  }
}
