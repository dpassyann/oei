import { Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { MarkdownRenderService } from '../../../../application/service/markdown-render.service';
import { CONTENT_TYPES, ContentType } from '../../../../domain/model/cms/content-type';
import { ApprovalGateRole } from '../../../../domain/model/cms/content-workflow';
import { I18nService } from '../../../i18n/i18n.service';

const NEW_CONTENT_ROUTE_ID = 'new';

/** Back-office editor: creation form for new content, or (for an existing content) metadata +
 * Markdown textarea/preview + workflow action buttons gated by the current status (task brief
 * point 6). */
@Component({
  selector: 'oei-cms-content-editor',
  imports: [RouterLink],
  templateUrl: './cms-content-editor.html',
  styleUrl: './cms-content-editor.scss',
})
export class CmsContentEditor {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contentService = inject(AdminContentApplicationService);
  private readonly markdownRender = inject(MarkdownRenderService);
  protected readonly i18n = inject(I18nService);

  protected readonly contentTypes = CONTENT_TYPES;

  protected readonly contentId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? NEW_CONTENT_ROUTE_ID)), {
    initialValue: NEW_CONTENT_ROUTE_ID,
  });
  protected readonly isNew = computed(() => this.contentId() === NEW_CONTENT_ROUTE_ID);

  private readonly contentResource = rxResource({
    params: () => (this.isNew() ? undefined : this.contentId()),
    stream: ({ params }) => this.contentService.getById(params as string),
  });

  protected readonly content = computed(() => this.contentResource.value());
  protected readonly notFound = computed(() => !this.isNew() && !this.contentResource.isLoading() && !this.content());

  private readonly versionsResource = rxResource({
    params: () => (this.isNew() ? undefined : this.contentId()),
    stream: ({ params }) => this.contentService.getVersions(params as string),
  });
  protected readonly versions = computed(() => this.versionsResource.value() ?? []);
  protected readonly currentVersion = computed(() => this.versions().find((version) => version.id === this.content()?.currentVersionId));

  protected readonly availableActions = computed(() => {
    const content = this.content();
    return content ? this.contentService.availableActions(content) : [];
  });

  // New-content creation form fields.
  protected readonly newType = signal<ContentType>('PAGE');
  protected readonly newSlug = signal('');
  protected readonly newTitle = signal('');

  // Markdown editor state (seeded from the current version once loaded).
  protected readonly bodyDraft = signal('');
  protected readonly previewHtml = computed(() => this.markdownRender.renderToSafeHtml(this.bodyDraft() || this.currentVersion()?.body || ''));

  onNewTypeChange(value: string): void {
    this.newType.set(value as ContentType);
  }

  onNewSlugChange(value: string): void {
    this.newSlug.set(value);
  }

  onNewTitleChange(value: string): void {
    this.newTitle.set(value);
  }

  onBodyDraftChange(value: string): void {
    this.bodyDraft.set(value);
  }

  createDraft(): void {
    this.contentService
      .create({ type: this.newType(), slug: this.newSlug(), sourceType: 'CMS', title: this.newTitle() })
      .subscribe((created) => this.router.navigate(['/cms', created.id]));
  }

  saveVersion(): void {
    const content = this.content();
    if (!content) return;
    this.contentService
      .createVersion(content.id, { language: 'fr', title: content.title, body: this.bodyDraft() || this.currentVersion()?.body || '' })
      .subscribe(() => {
        this.contentResource.reload();
        this.versionsResource.reload();
      });
  }

  submit(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.submit(content.id).subscribe(() => this.contentResource.reload());
  }

  approve(role: ApprovalGateRole): void {
    const content = this.content();
    if (!content) return;
    this.contentService.approve(content.id, { role, decision: 'APPROVED' }).subscribe(() => this.contentResource.reload());
  }

  reject(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.reject(content.id, 'Rejeté depuis le back-office (exemple).').subscribe(() => this.contentResource.reload());
  }

  requestTranslation(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.requestTranslation(content.id).subscribe(() => this.contentResource.reload());
  }

  schedule(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.schedule(content.id).subscribe(() => this.contentResource.reload());
  }

  publish(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.publish(content.id).subscribe(() => this.contentResource.reload());
  }

  archive(): void {
    const content = this.content();
    if (!content) return;
    this.contentService.archive(content.id).subscribe(() => this.contentResource.reload());
  }
}
