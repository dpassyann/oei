import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-partenaires',
  imports: [RouterLink],
  templateUrl: './partenaires.html',
  styleUrl: './partenaires.scss',
})
export class Partenaires {
  private readonly partnersService = inject(PartnerApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly partnersResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.partnersService.getPartners(params),
  });

  protected readonly partners = computed(() => this.partnersResource.value() ?? []);
}
