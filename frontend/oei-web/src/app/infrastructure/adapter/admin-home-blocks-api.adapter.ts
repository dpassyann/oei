import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminHomeBlocksPort, HomeBlockUpdateInput } from '../../domain/port/admin/admin-home-blocks.port';
import { HomeBlockConfig } from '../../domain/model/admin/admin-home-block';

// Speculative contract, same convention as `AdminMenusApiAdapter`/`AdminEmailTemplatesApiAdapter`:
// `/api/admin/v1/home-blocks` does not exist in `openapi/oei-api.yaml` yet. Even once it does,
// this admin screen's writes should stay decoupled from whatever `HomeSectionsApplicationService`
// reads for the actual `/` page — see `AdminHomeBlocksMockAdapter`'s doc comment.
const ADMIN_HOME_BLOCKS_API_BASE = '/api/admin/v1/home-blocks';

@Service()
export class AdminHomeBlocksApiAdapter implements AdminHomeBlocksPort {
  private readonly http = inject(HttpClient);

  list(): Observable<HomeBlockConfig[]> {
    return this.http.get<HomeBlockConfig[]>(ADMIN_HOME_BLOCKS_API_BASE);
  }

  update(id: string, input: HomeBlockUpdateInput): Observable<HomeBlockConfig> {
    return this.http.put<HomeBlockConfig>(`${ADMIN_HOME_BLOCKS_API_BASE}/${id}`, input);
  }

  reorder(id: string, newOrder: number): Observable<HomeBlockConfig[]> {
    return this.http.patch<HomeBlockConfig[]>(`${ADMIN_HOME_BLOCKS_API_BASE}/${id}/order`, { order: newOrder });
  }
}
