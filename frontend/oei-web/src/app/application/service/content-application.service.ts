import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CONTENT_REPOSITORY_PORT } from '../../domain/port/content-repository.port';
import { HomeContentDto } from '../dto/home-content.dto';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `RuntimeConfig` (see infrastructure/config/runtime-config.ts),
// where its availability in the installed @angular/core was confirmed.
//
// Returns an `Observable` (not a `Promise`) — see `src/app/infrastructure/adapter/README.md`
// for the RxJS-end-to-end architecture this service is part of.
@Service()
export class ContentApplicationService {
  private readonly repository = inject(CONTENT_REPOSITORY_PORT);

  getHomeContent(lang: string): Observable<HomeContentDto> {
    return this.repository
      .getHomeContent(lang)
      .pipe(map((document) => ({ title: document.title, body: document.body, isFallback: document.isFallback })));
  }
}
