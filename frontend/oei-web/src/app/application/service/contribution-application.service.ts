import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONTRIBUTION_PORT, ContributionCreationInput } from '../../domain/port/governance/contribution.port';
import { ContentComment, ContentContribution } from '../../domain/model/governance/content-contribution.model';
import { diffLines, DiffLine } from '../../domain/model/governance/content-diff';

@Service()
export class ContributionApplicationService {
  private readonly port = inject(CONTRIBUTION_PORT);

  listMine(): Observable<ContentContribution[]> {
    return this.port.listMine();
  }

  listForContent(contentId: string): Observable<ContentContribution[]> {
    return this.port.listForContent(contentId);
  }

  create(input: ContributionCreationInput): Observable<ContentContribution> {
    return this.port.create(input);
  }

  listComments(contributionId: string): Observable<ContentComment[]> {
    return this.port.listComments(contributionId);
  }

  addComment(contributionId: string, body: string): Observable<ContentComment> {
    return this.port.addComment(contributionId, body);
  }

  /** Visual before/after diff of a contribution's proposed patch against the content's current
   * published/draft body — the "diff" required by the plan's "Contributions membres" section. */
  diffAgainstCurrentBody(contribution: ContentContribution, currentBody: string): readonly DiffLine[] {
    return diffLines(currentBody, contribution.patch);
  }

  /** Same diff, computed lazily from an Observable pair (current body may come from a
   * `rxResource`), reshaped for direct template consumption. */
  diffAgainstCurrentBody$(contribution: ContentContribution, currentBody$: Observable<string>): Observable<readonly DiffLine[]> {
    return currentBody$.pipe(map((currentBody) => this.diffAgainstCurrentBody(contribution, currentBody)));
  }
}
