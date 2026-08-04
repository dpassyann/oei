import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ContributionCreationInput, ContributionPort } from '../../domain/port/governance/contribution.port';
import {
  ContentComment,
  ContentContribution,
  createContentComment,
  createContentContribution,
} from '../../domain/model/governance/content-contribution.model';

// One demonstration member contribution (task brief point 8: "1 contribution membre d'exemple
// avec diff") proposing a Markdown patch against `content-reglement-interieur`'s current body —
// see `AdminContentMockAdapter`'s `version-reglement-1` for the "before" text this diffs against.
function buildSeedContributions(): ContentContribution[] {
  return [
    createContentContribution({
      id: 'contribution-reglement-1',
      contentId: 'content-reglement-interieur',
      patch: '# Règlement intérieur\n\nArticle 1 — Objet et champ d’application. (Proposition de clarification, exemple mocké.)',
      authorMemberId: 'member-demo',
      status: 'PROPOSED',
      createdAt: '2026-07-20T11:00:00Z',
    }),
  ];
}

function buildSeedComments(): ContentComment[] {
  return [
    createContentComment({
      id: 'comment-reglement-1-1',
      contributionId: 'contribution-reglement-1',
      contentId: null,
      authorId: 'member-demo',
      body: "Je propose de préciser le champ d'application de l'article 1 (exemple mocké).",
      createdAt: '2026-07-20T11:05:00Z',
    }),
  ];
}

let seedContributions: ContentContribution[] = buildSeedContributions();
let seedComments: ContentComment[] = buildSeedComments();

export function resetContributionFixtures(): void {
  seedContributions = buildSeedContributions();
  seedComments = buildSeedComments();
}

@Service()
export class ContributionMockAdapter implements ContributionPort {
  listMine(): Observable<ContentContribution[]> {
    return of(seedContributions.filter((contribution) => contribution.authorMemberId === 'member-demo'));
  }

  listForContent(contentId: string): Observable<ContentContribution[]> {
    return of(seedContributions.filter((contribution) => contribution.contentId === contentId));
  }

  create(input: ContributionCreationInput): Observable<ContentContribution> {
    const created = createContentContribution({
      id: `contribution-${seedContributions.length + 1}`,
      contentId: input.contentId,
      patch: input.patch,
      authorMemberId: 'member-demo',
      status: 'PROPOSED',
      createdAt: new Date().toISOString(),
    });
    seedContributions = [...seedContributions, created];
    return of(created);
  }

  listComments(contributionId: string): Observable<ContentComment[]> {
    return of(seedComments.filter((comment) => comment.contributionId === contributionId));
  }

  addComment(contributionId: string, body: string): Observable<ContentComment> {
    const created = createContentComment({
      id: `comment-${contributionId}-${seedComments.length + 1}`,
      contributionId,
      contentId: null,
      authorId: 'member-demo',
      body,
      createdAt: new Date().toISOString(),
    });
    seedComments = [...seedComments, created];
    return of(created);
  }
}
