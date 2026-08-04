import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-partenaire-detail',
  imports: [RouterLink],
  templateUrl: './partenaire-detail.html',
  styleUrl: './partenaire-detail.scss',
})
export class PartenaireDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly partnersService = inject(PartnerApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly partnerId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  private readonly partnerResource = rxResource({
    params: () => ({ id: this.partnerId(), lang: this.i18n.currentLang() }),
    stream: ({ params }) => this.partnersService.getPartner(params.id, params.lang),
  });

  // `resource.value()` throws when the resource is in an error state (e.g. an unknown
  // partner id) — `hasValue()` must be checked first to safely read a possibly-absent value.
  protected readonly partner = computed(() => (this.partnerResource.hasValue() ? this.partnerResource.value() : undefined));
  protected readonly notFound = computed(() => this.partnerResource.error() !== undefined);
}
