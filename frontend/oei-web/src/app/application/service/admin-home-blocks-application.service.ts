import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_HOME_BLOCKS_PORT, HomeBlockUpdateInput } from '../../domain/port/admin/admin-home-blocks.port';
import { HomeBlockConfig } from '../../domain/model/admin/admin-home-block';

/**
 * Ordering/activation/label logic for the admin "blocs-home" section (task brief §CMS
 * "blocs-home"). Kept out of the `AdminHomeBlocks` component, same convention as
 * `AdminMenusApplicationService` — the move-up/move-down swap is the non-trivial piece.
 */
@Service()
export class AdminHomeBlocksApplicationService {
  private readonly port = inject(ADMIN_HOME_BLOCKS_PORT);

  list(): Observable<HomeBlockConfig[]> {
    return this.port.list().pipe(map((blocks) => blocks.slice().sort((a, b) => a.order - b.order)));
  }

  update(id: string, input: HomeBlockUpdateInput): Observable<HomeBlockConfig> {
    return this.port.update(id, input);
  }

  toggleActive(block: HomeBlockConfig): Observable<HomeBlockConfig> {
    return this.port.update(block.id, { label: block.label, active: !block.active });
  }

  /**
   * Swaps `block` with its ordering neighbour. Only `block`'s new order is persisted through the
   * port (matching `AdminMenusApplicationService.move`'s convention); the neighbour's order is
   * swapped in the returned local snapshot so the caller can re-render immediately without a
   * second round-trip.
   */
  move(blocks: readonly HomeBlockConfig[], block: HomeBlockConfig, direction: 'up' | 'down'): Observable<HomeBlockConfig[]> {
    const sorted = blocks.slice().sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((candidate) => candidate.id === block.id);
    const neighbourIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || neighbourIndex < 0 || neighbourIndex >= sorted.length) {
      return this.list();
    }
    const neighbour = sorted[neighbourIndex];
    return this.port.reorder(block.id, neighbour.order).pipe(
      map(() =>
        sorted.map((candidate) => {
          if (candidate.id === block.id) {
            return { ...candidate, order: neighbour.order };
          }
          if (candidate.id === neighbour.id) {
            return { ...candidate, order: block.order };
          }
          return candidate;
        }),
      ),
    );
  }
}
