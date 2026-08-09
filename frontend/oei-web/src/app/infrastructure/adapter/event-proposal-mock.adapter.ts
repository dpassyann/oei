import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EventProposalDraft, EventProposalPort } from '../../domain/port/event/event-proposal.port';
import { createEventProposal, EventProposal, EventProposalStatus } from '../../domain/model/event/event-proposal';

const DEMO_AUTHOR_ID = 'demo-member-1';

// Static, always-plausible AI precheck result (per this task's brief: "retourne toujours un
// résultat statique plausible — PAS de vrai appel IA"). Never blocks submission and never
// auto-publishes — it only ever assists the human moderator, who still sees `MODERATOR_REVIEW`
// next (see `EventModerationMockAdapter`).
function buildAiPrecheck(): EventProposal['aiPrecheck'] {
  return {
    passed: true,
    summary:
      '[Précheck IA - démonstration] Aucune faute majeure ni contenu inapproprié détecté. ' +
      'Proposition cohérente avec les thématiques OEI ; reformulation mineure suggérée sur le titre.',
    checkedAt: new Date().toISOString(),
  };
}

function buildSeedProposals(): EventProposal[] {
  return [
    createEventProposal({
      id: 'event-proposal-demo-1',
      title: '[Proposition - démo] Atelier pratique : audit de sécurité applicative',
      description:
        "Atelier de démonstration proposé par un membre pour partager une méthodologie d'audit " +
        'de sécurité applicative, avec exercices pratiques sur un cas fictif.',
      type: 'workshop',
      startAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      timezone: 'Europe/Paris',
      country: 'FR',
      city: 'Toulouse',
      venue: 'Espace de coworking Le Node',
      authorId: 'member-demo-6',
      status: 'MODERATOR_REVIEW',
      submittedAt: '2026-07-30T10:00:00.000Z',
      aiPrecheck: buildAiPrecheck(),
    }),
  ];
}

let seedProposals: EventProposal[] = buildSeedProposals();
let sequence = 0;

/** Test-only reset hook, mirrors `resetArticleModerationFixtures()`. */
export function resetEventProposalFixtures(): void {
  seedProposals = buildSeedProposals();
  sequence = 0;
}

/** Read-only extension point for `EventModerationMockAdapter` (shares the same in-memory
 * "table" as this adapter, mirroring `ArticleModerationMockAdapter`/`ArticleSubmissionMockAdapter`
 * — the moderation queue reads/writes the very submissions a member created here). */
export function getEventProposals(): EventProposal[] {
  return seedProposals;
}

export function setEventProposalStatus(
  id: string,
  status: EventProposalStatus,
  moderatorNote?: string,
): EventProposal | undefined {
  const found = seedProposals.find((proposal) => proposal.id === id);
  if (!found) {
    return undefined;
  }
  const updated = createEventProposal({ ...found, status, moderatorNote: moderatorNote ?? found.moderatorNote });
  seedProposals = seedProposals.map((proposal) => (proposal.id === id ? updated : proposal));
  return updated;
}

@Service()
export class EventProposalMockAdapter implements EventProposalPort {
  submit(draft: EventProposalDraft): Observable<EventProposal> {
    sequence += 1;
    // Simulated workflow: SUBMITTED -> AI_PRECHECK -> MODERATOR_REVIEW happen synchronously in
    // this mock (no real async AI call) — the member immediately sees "awaiting moderation" with
    // a precheck summary already attached, exactly as if the (simulated) AI had already run.
    const proposal = createEventProposal({
      id: `demo-event-proposal-${sequence}`,
      title: draft.title,
      description: draft.description,
      type: draft.type,
      startAt: draft.startAt,
      endAt: draft.endAt,
      timezone: draft.timezone,
      country: draft.country,
      city: draft.city,
      venue: draft.venue,
      onlineUrl: draft.onlineUrl,
      imageUrl: draft.imageUrl,
      authorId: DEMO_AUTHOR_ID,
      status: 'MODERATOR_REVIEW',
      submittedAt: new Date().toISOString(),
      aiPrecheck: buildAiPrecheck(),
    });
    seedProposals.push(proposal);
    return of(proposal);
  }

  listMine(): Observable<EventProposal[]> {
    return of(seedProposals.filter((proposal) => proposal.authorId === DEMO_AUTHOR_ID));
  }
}

// Re-exported for `EventModerationMockAdapter`'s "not found" error case, kept identical to how
// `ArticleModerationMockAdapter` reports the same failure.
export function throwNotFound(id: string): Observable<never> {
  return throwError(() => new Error(`Event proposal "${id}" not found.`));
}
