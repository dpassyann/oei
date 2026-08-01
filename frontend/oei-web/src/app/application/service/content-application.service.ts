import { Service, inject } from '@angular/core';
import { CONTENT_REPOSITORY_PORT } from '../../domain/port/content-repository.port';
import { HomeContentDto } from '../dto/home-content.dto';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `RuntimeConfig` (see infrastructure/config/runtime-config.ts),
// where its availability in the installed @angular/core was confirmed.
@Service()
export class ContentApplicationService {
  private readonly repository = inject(CONTENT_REPOSITORY_PORT);

  async getHomeContent(lang: string): Promise<HomeContentDto> {
    const document = await this.repository.getHomeContent(lang);
    return { title: document.title, body: document.body, isFallback: document.isFallback };
  }
}
