import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { InstitutionPublicApplicationService } from '../../../application/service/institution-public-application.service';
import { I18nService } from '../../i18n/i18n.service';

// Page publique institutionnelle — doc 03 §"Page publique". Tout contenu affiché ici est
// déjà modéré côté port (`InstitutionPublicPort`/adapter) : seules les publications et
// opportunités PUBLISHED sont incluses dans la ressource.
@Component({
  selector: 'oei-institution-publique',
  templateUrl: './institution-publique.html',
  styleUrl: './institution-publique.scss',
})
export class InstitutionPublique {
  private readonly route = inject(ActivatedRoute);
  private readonly publicService = inject(InstitutionPublicApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), { initialValue: '' });

  private readonly pageResource = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.publicService.getPublicInstitution(params),
  });

  // `resource.value()` throws in an error state — `hasValue()` must be checked first (same
  // pattern as `PartenaireDetail`).
  protected readonly page = computed(() => (this.pageResource.hasValue() ? this.pageResource.value() : undefined));
  protected readonly notFound = computed(() => this.pageResource.error() !== undefined);
}
