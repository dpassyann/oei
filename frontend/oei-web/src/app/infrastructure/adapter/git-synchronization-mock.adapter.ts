import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { GitSynchronizationPort } from '../../domain/port/governance/git-synchronization.port';
import { createGitSynchronization, GitSyncedFile, GitSynchronization } from '../../domain/model/governance/content-contribution.model';

// Fully mocked, read-only Git synchronization (no real webhook/CI call — task brief point "la
// synchronisation Git est mockée en LECTURE seule"). `SYNCED_FILES` simulates 2 Markdown files
// with complete front matter as they would be pulled from the normative repository, matching the
// exact example in the "Front matter" section of `04-PROMPT-CMS-GOUVERNANCE-DOCUMENTAIRE.md`.
export const SYNCED_FILES: readonly GitSyncedFile[] = [
  {
    path: '200-WHITE-PAPERS/livre-blanc-complet.md',
    gitRef: 'main',
    commitSha: 'a1b2c3d',
    rawContent: `---
id: oei-whitepaper
type: whitepaper
title: "Livre Blanc"
slug: "livre-blanc"
version: "1.0"
status: published
language: fr
sourceLanguage: fr
effectiveDate: 2026-08-01
authors:
  - yann-deungoue
governance:
  approvalRequired: true
  decisionId: DEC-2026-001
translations:
  en: pending
---

# Livre Blanc

Synthèse des positions de l'OEI. (Exemple mocké synchronisé depuis Git.)
`,
  },
  {
    path: '100-GOVERNANCE/reglement-interieur.md',
    gitRef: 'main',
    commitSha: 'd4e5f6a',
    rawContent: `---
id: oei-reglement-interieur
type: regulation
title: "Règlement intérieur"
slug: "reglement-interieur"
version: "2.1-draft"
status: in_review
language: fr
sourceLanguage: fr
effectiveDate: 2026-09-01
authors:
  - admin-demo
governance:
  approvalRequired: true
  decisionId: null
translations:
  en: pending
---

# Règlement intérieur

Article 1 — Objet. (Exemple mocké en cours de révision.)
`,
  },
];

function buildSeedSynchronizations(): GitSynchronization[] {
  return [
    createGitSynchronization({
      id: 'sync-1',
      startedAt: '2026-08-01T08:00:00Z',
      finishedAt: '2026-08-01T08:00:05Z',
      status: 'SUCCESS',
      commitsProcessed: SYNCED_FILES.length,
      errors: [],
    }),
  ];
}

let seedSynchronizations: GitSynchronization[] = buildSeedSynchronizations();

export function resetGitSynchronizationFixtures(): void {
  seedSynchronizations = buildSeedSynchronizations();
}

@Service()
export class GitSynchronizationMockAdapter implements GitSynchronizationPort {
  trigger(): Observable<GitSynchronization> {
    const now = new Date().toISOString();
    const synchronization = createGitSynchronization({
      id: `sync-${seedSynchronizations.length + 1}`,
      startedAt: now,
      finishedAt: now,
      status: 'SUCCESS',
      commitsProcessed: SYNCED_FILES.length,
      errors: [],
    });
    seedSynchronizations = [...seedSynchronizations, synchronization];
    return of(synchronization);
  }

  list(): Observable<GitSynchronization[]> {
    return of(seedSynchronizations);
  }

  getById(id: string): Observable<GitSynchronization> {
    const found = seedSynchronizations.find((synchronization) => synchronization.id === id);
    return found ? of(found) : throwError(() => new Error(`GitSynchronization "${id}" not found.`));
  }

  listSyncedFiles(): Observable<GitSyncedFile[]> {
    return of([...SYNCED_FILES]);
  }
}
