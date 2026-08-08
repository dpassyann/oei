import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { I18nService } from '../../i18n/i18n.service';

// Same `NewsPort.getLatestNews` feed as the home page's "Actualités" section (see
// `HomeSectionsApplicationService`/`NewsMockAdapter`), but with a higher limit since this is the
// dedicated news-listing page rather than a home-page excerpt. `NewsMockAdapter` merges approved
// member `ArticleSubmission`s (see `article-moderation-mock.adapter.ts`) into this same feed, so
// an article approved from `/cms/moderation` appears here without a parallel publication system.
const NEWS_LIMIT = 20;

@Component({
  selector: 'oei-actualites',
  imports: [RouterLink],
  templateUrl: './actualites.html',
  styleUrl: './actualites.scss',
})
export class Actualites {
  protected readonly i18n = inject(I18nService);
  private readonly sections = inject(HomeSectionsApplicationService);

  private readonly newsResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.sections.getLatestNews(NEWS_LIMIT, params),
  });
  protected readonly news = computed(() => this.newsResource.value() ?? []);
}
