import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminEmailTemplatesApplicationService } from '../../../../application/service/admin-email-templates-application.service';
import { I18nService } from '../../../i18n/i18n.service';

/**
 * Detail/edit view for one email template (task brief §CMS "templates email"): subject (i18n
 * key) + body edition, a read-only rendered preview (mock token substitution, computed by
 * `AdminEmailTemplatesApplicationService.renderPreview` — never a real Thymeleaf render), and the
 * list of available `{{token}}` variables. Saving only updates the in-memory mock adapter.
 */
@Component({
  selector: 'oei-admin-email-template-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-email-template-detail.html',
  styleUrl: './admin-email-template-detail.scss',
})
export class AdminEmailTemplateDetail {
  private readonly templatesService = inject(AdminEmailTemplatesApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly templateId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: '' });

  private readonly templateResource = rxResource({
    params: () => this.templateId(),
    stream: ({ params }) => this.templatesService.getById(params),
  });

  protected readonly template = computed(() => this.templateResource.value());
  protected readonly subjectKey = signal('');
  protected readonly body = signal('');
  protected readonly active = signal(true);
  protected readonly saved = signal(false);
  protected readonly initialized = signal(false);

  protected readonly preview = computed(() => {
    const current = this.template();
    if (!current) {
      return '';
    }
    return this.templatesService.renderPreview({ ...current, body: this.body() });
  });

  constructor() {
    // Sync the editable signals from the loaded resource exactly once per template load — a
    // plain `computed` can't hold local edit state, and re-deriving on every `body()`/`active()`
    // write would overwrite in-progress edits.
    effect(() => {
      const current = this.templateResource.value();
      if (current && !this.initialized()) {
        this.subjectKey.set(current.subjectKey);
        this.body.set(current.body);
        this.active.set(current.active);
        this.initialized.set(true);
      }
    });
  }

  protected save(): void {
    const id = this.templateId();
    if (!id) {
      return;
    }
    this.templatesService
      .update(id, { subjectKey: this.subjectKey(), body: this.body(), active: this.active() })
      .subscribe(() => this.saved.set(true));
  }

  protected backToList(): void {
    void this.router.navigateByUrl('/admin/templates-email');
  }
}
