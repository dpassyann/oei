import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AdminHomeBlocksPort, HomeBlockUpdateInput } from '../../domain/port/admin/admin-home-blocks.port';
import { createHomeBlockConfig, HomeBlockConfig } from '../../domain/model/admin/admin-home-block';

// Mirrors the real, current sections of `Home`/`home.html` (hero, stats, "domaines d'action",
// latest news, partners, resources) so the seed list matches what actually renders today. This
// mock never wires back into `HomeSectionsApplicationService`/`Home` — toggling a block here is
// purely a back-office rehearsal, not a live change to the public `/` page (task brief explicitly
// scopes this out: "n'affecte PAS réellement le rendu de la vraie page /").
function buildSeedHomeBlocks(): HomeBlockConfig[] {
  return [
    createHomeBlockConfig({ id: 'block-hero', key: 'hero', label: 'Bannière principale (hero)', order: 1 }),
    createHomeBlockConfig({ id: 'block-stats', key: 'stats', label: 'Nos chiffres', order: 2 }),
    createHomeBlockConfig({ id: 'block-domain-areas', key: 'domainAreas', label: "Nos domaines d'action", order: 3 }),
    createHomeBlockConfig({ id: 'block-latest-news', key: 'latestNews', label: 'Actualités récentes', order: 4 }),
    createHomeBlockConfig({ id: 'block-partners', key: 'partners', label: 'Ils nous soutiennent (partenaires)', order: 5 }),
    createHomeBlockConfig({ id: 'block-resources', key: 'resources', label: 'Nos ressources', order: 6 }),
  ];
}

let blocks: HomeBlockConfig[] = buildSeedHomeBlocks();

export function resetAdminHomeBlocksFixtures(): void {
  blocks = buildSeedHomeBlocks();
}

function findOrThrow(id: string): HomeBlockConfig {
  const found = blocks.find((block) => block.id === id);
  if (!found) {
    throw new Error(`Home block "${id}" not found.`);
  }
  return found;
}

@Service()
export class AdminHomeBlocksMockAdapter implements AdminHomeBlocksPort {
  list(): Observable<HomeBlockConfig[]> {
    return of([...blocks]);
  }

  update(id: string, input: HomeBlockUpdateInput): Observable<HomeBlockConfig> {
    try {
      const existing = findOrThrow(id);
      const updated = createHomeBlockConfig({ ...existing, ...input });
      blocks = blocks.map((block) => (block.id === id ? updated : block));
      return of(updated);
    } catch (error) {
      return throwError(() => error);
    }
  }

  reorder(id: string, newOrder: number): Observable<HomeBlockConfig[]> {
    try {
      const existing = findOrThrow(id);
      const updated = createHomeBlockConfig({ ...existing, order: newOrder });
      blocks = blocks.map((block) => (block.id === id ? updated : block));
      return of([...blocks]);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
