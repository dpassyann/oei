import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicationsApplicationService } from '../../../application/service/publications-application.service';
import { PublicationCategory } from '../../../domain/model/publication';
import { I18nService } from '../../i18n/i18n.service';

// The 7 publication categories required by the spec (doc 01, section 6). Rendered as an
// informational list of what the page will eventually contain — not fabricated content —
// each resolving to `publications.categories.<key>` in the i18n dictionaries.
const CATEGORIES: readonly PublicationCategory[] = [
  'article',
  'pressRelease',
  'whitePaper',
  'report',
  'event',
  'consultation',
  'callForContribution',
];

@Component({
  selector: 'oei-publications',
  templateUrl: './publications.html',
  styleUrl: './publications.scss',
})
export class Publications {
  private readonly publicationsService = inject(PublicationsApplicationService);
  protected readonly i18n = inject(I18nService);

  protected readonly categories = CATEGORIES;

  private readonly publicationsResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.publicationsService.getPublications(params),
  });

  protected readonly publications = computed(() => this.publicationsResource.value() ?? []);
}
