import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField, required } from '@angular/forms/signals';
import { ArticleSubmissionApplicationService } from '../../../../application/service/article-submission-application.service';
import { ArticleSubmission } from '../../../../domain/model/article/article-submission';
import { I18nService } from '../../../i18n/i18n.service';

interface ArticleDraftFields {
  title: string;
  body: string;
  coverImageUrl: string;
}

const EMPTY_DRAFT: ArticleDraftFields = { title: '', body: '', coverImageUrl: '' };

// Member-facing submission form for `/actualites` articles (docs: task "Soumission d'article").
// Submitting here only ever creates a `pending` `ArticleSubmission` — it never writes to the
// public `/actualites` content directly. The moderation queue/decision screen that turns a
// `pending` submission into `approved` (and therefore visible on `/actualites`) is a CMS
// concern built separately (see `presentation/pages/cms/`); this page's job stops at "the
// member submitted, it is now awaiting moderation".
@Component({
  selector: 'oei-publier-article',
  imports: [FormField],
  templateUrl: './publier-article.html',
  styleUrl: './publier-article.scss',
})
export class PublierArticle {
  private readonly articleSubmissionApplicationService = inject(ArticleSubmissionApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly submissionsResource = rxResource({
    stream: () => this.articleSubmissionApplicationService.listMine(),
  });
  protected readonly submissions = computed<ArticleSubmission[]>(() => this.submissionsResource.value() ?? []);

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal(false);

  private readonly draftModel = signal<ArticleDraftFields>({ ...EMPTY_DRAFT });
  protected readonly articleForm = form(this.draftModel, (path) => {
    required(path.title);
    required(path.body);
  });

  protected submit(): void {
    if (this.submitting()) {
      return;
    }
    const draft = this.draftModel();
    if (!draft.title.trim() || !draft.body.trim()) {
      return;
    }
    this.submitting.set(true);
    this.submitError.set(false);
    this.articleSubmissionApplicationService
      .submit({
        title: draft.title,
        body: draft.body,
        coverImageUrl: draft.coverImageUrl || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.draftModel.set({ ...EMPTY_DRAFT });
          this.submissionsResource.reload();
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set(true);
        },
      });
  }

  protected submitAnother(): void {
    this.submitted.set(false);
  }
}
