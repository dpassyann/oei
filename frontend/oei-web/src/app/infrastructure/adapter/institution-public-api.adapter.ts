import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionPublicPort } from '../../domain/port/institution/institution-public.port';
import { InstitutionPublicPage } from '../../domain/model/institution/institution-public-page';

// Endpoints under `/api/public/v1/**` are role-versioned per ADR 0002 and use a literal prefix
// rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1` public-site
// base and is only overridable for that historical family of endpoints).
const PUBLIC_API_BASE = '/api/public/v1';

@Service()
export class InstitutionPublicApiAdapter implements InstitutionPublicPort {
  private readonly http = inject(HttpClient);

  // `GET /api/public/v1/institutions/{slug}` already bundles `institution` + `partnership` +
  // (published-only) `publications`/`opportunities` in a single `InstitutionPublicPage`
  // response — matching this port's aggregated shape exactly, so no extra calls to the
  // separate paginated `/institutions/{slug}/publications` and `/opportunities` endpoints are
  // needed here. A documented `404` (unknown slug) is intentionally left to propagate as an
  // error rather than being swallowed — see `InstitutionPublique`'s `resource.error()`-based
  // not-found handling, which is this port's established 404 convention.
  getPublicInstitution(slug: string): Observable<InstitutionPublicPage> {
    return this.http.get<InstitutionPublicPage>(`${PUBLIC_API_BASE}/institutions/${slug}`);
  }
}
