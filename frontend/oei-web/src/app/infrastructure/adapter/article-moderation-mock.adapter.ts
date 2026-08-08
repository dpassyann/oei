import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ArticleModerationPort } from '../../domain/port/article-moderation.port';
import { ArticleSubmission, createArticleSubmission } from '../../domain/model/article/article-submission';

// Demonstration data: 3 member-submitted articles, all `pending`, clearly labelled as
// placeholders (same "demo-data honesty" rule as `AdminContentMockAdapter`/`NewsMockAdapter` —
// see their respective comments). None of this is real OEI content.
//
// Built via a factory function (not a plain array literal) so `resetArticleModerationFixtures()`
// can restore genuinely pristine state between specs, mirroring `AdminContentMockAdapter`'s
// `buildSeedContents()`/`resetAdminContentFixtures()` pattern.
function buildSeedSubmissions(): ArticleSubmission[] {
  return [
    createArticleSubmission({
      id: 'article-submission-demo-1',
      title: '[Article soumis - démo] Retour d’expérience : certification et éthique',
      body:
        "Ceci est un article de démonstration soumis par un membre pour illustrer la file de modération. " +
        'Un membre certifié y partagerait typiquement un retour d’expérience sur le code de déontologie.',
      authorId: 'member-demo-1',
      status: 'pending',
      submittedAt: '2026-07-28T09:15:00.000Z',
    }),
    createArticleSubmission({
      id: 'article-submission-demo-2',
      title: '[Article soumis - démo] Cybersécurité : bilan d’un groupe de travail',
      body:
        'Article de démonstration : un membre relate les travaux du groupe de travail cybersécurité ' +
        'et propose des pistes pour le prochain trimestre.',
      coverImageUrl: '/assets/news/appel-contribution.svg',
      authorId: 'member-demo-2',
      status: 'pending',
      submittedAt: '2026-07-30T14:40:00.000Z',
    }),
    createArticleSubmission({
      id: 'article-submission-demo-3',
      title: '[Article soumis - démo] Informatique verte : premiers résultats de terrain',
      body:
        'Article de démonstration : synthèse de mesures d’écoconception logicielle menées par un membre ' +
        'dans son organisation, soumise pour publication sur le site public.',
      authorId: 'member-demo-3',
      status: 'pending',
      submittedAt: '2026-08-02T08:00:00.000Z',
    }),
  ];
}

// Module-level mutable state (a genuine in-memory mock "database", same pattern as
// `AdminContentMockAdapter`'s `seedContents`) so approve/reject transitions persist across calls
// within one app session. `NewsMockAdapter` reads `getApprovedArticleSubmissions()` below to
// surface approved submissions in `/actualites` without a parallel publication system.
let seedSubmissions: ArticleSubmission[] = buildSeedSubmissions();

/** Test-only reset hook, mirrors `resetAdminContentFixtures()`. */
export function resetArticleModerationFixtures(): void {
  seedSubmissions = buildSeedSubmissions();
}

/** Read-only extension point consumed by `NewsMockAdapter.getLatestNews` — see its comment for
 * why approved article submissions are merged into the same news feed rather than duplicating
 * a parallel publication list. */
export function getApprovedArticleSubmissions(): readonly ArticleSubmission[] {
  return seedSubmissions.filter((submission) => submission.status === 'approved');
}

@Service()
export class ArticleModerationMockAdapter implements ArticleModerationPort {
  listPending(): Observable<ArticleSubmission[]> {
    return of(seedSubmissions.filter((submission) => submission.status === 'pending'));
  }

  approve(id: string): Observable<void> {
    const found = seedSubmissions.find((submission) => submission.id === id);
    if (!found) {
      return throwError(() => new Error(`Article submission "${id}" not found.`));
    }
    seedSubmissions = seedSubmissions.map((submission) =>
      submission.id === id ? createArticleSubmission({ ...submission, status: 'approved' }) : submission,
    );
    return of(undefined);
  }

  reject(id: string, _reason?: string): Observable<void> {
    const found = seedSubmissions.find((submission) => submission.id === id);
    if (!found) {
      return throwError(() => new Error(`Article submission "${id}" not found.`));
    }
    seedSubmissions = seedSubmissions.map((submission) =>
      submission.id === id ? createArticleSubmission({ ...submission, status: 'rejected' }) : submission,
    );
    return of(undefined);
  }
}
