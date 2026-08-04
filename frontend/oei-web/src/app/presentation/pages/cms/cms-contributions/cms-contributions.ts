import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ContributionApplicationService } from '../../../../application/service/contribution-application.service';
import { AdminContentApplicationService } from '../../../../application/service/admin-content-application.service';
import { ContentContribution } from '../../../../domain/model/governance/content-contribution.model';
import { DiffLine } from '../../../../domain/model/governance/content-diff';
import { I18nService } from '../../../i18n/i18n.service';

/** Back-office view of member contributions: list, visual before/after diff against the current
 * content body, and comments (task brief point 6 "Vue Contributions"). */
@Component({
  selector: 'oei-cms-contributions',
  imports: [RouterLink],
  templateUrl: './cms-contributions.html',
  styleUrl: './cms-contributions.scss',
})
export class CmsContributions {
  private readonly contributionsService = inject(ContributionApplicationService);
  private readonly contentService = inject(AdminContentApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly contributionsResource = rxResource({
    params: () => true,
    stream: () => this.contributionsService.listMine(),
  });
  protected readonly contributions = computed(() => this.contributionsResource.value() ?? []);

  protected readonly selectedContributionId = signal<string | null>(null);
  protected readonly selectedContribution = computed(() =>
    this.contributions().find((contribution) => contribution.id === this.selectedContributionId()),
  );

  private readonly selectedContentResource = rxResource({
    params: () => this.selectedContribution()?.contentId,
    stream: ({ params }) => this.contentService.getById(params as string),
  });

  private readonly selectedVersionsResource = rxResource({
    params: () => this.selectedContribution()?.contentId,
    stream: ({ params }) => this.contentService.getVersions(params as string),
  });

  protected readonly diff = computed<readonly DiffLine[]>(() => {
    const contribution = this.selectedContribution();
    if (!contribution) return [];
    const content = this.selectedContentResource.value();
    const versions = this.selectedVersionsResource.value() ?? [];
    const currentBody = versions.find((version) => version.id === content?.currentVersionId)?.body ?? '';
    return this.contributionsService.diffAgainstCurrentBody(contribution, currentBody);
  });

  private readonly commentsResource = rxResource({
    params: () => this.selectedContributionId() ?? undefined,
    stream: ({ params }) => this.contributionsService.listComments(params as string),
  });
  protected readonly comments = computed(() => this.commentsResource.value() ?? []);

  protected readonly newComment = signal('');

  select(contribution: ContentContribution): void {
    this.selectedContributionId.set(contribution.id);
  }

  onNewCommentChange(value: string): void {
    this.newComment.set(value);
  }

  submitComment(): void {
    const contributionId = this.selectedContributionId();
    if (!contributionId || !this.newComment().trim()) return;
    this.contributionsService.addComment(contributionId, this.newComment()).subscribe(() => {
      this.newComment.set('');
      this.commentsResource.reload();
    });
  }
}
