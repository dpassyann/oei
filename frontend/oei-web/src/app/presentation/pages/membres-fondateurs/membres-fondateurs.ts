import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';

const FEE_TIER_COUNT = 4;

@Component({
  selector: 'oei-membres-fondateurs',
  imports: [RouterLink],
  templateUrl: './membres-fondateurs.html',
  styleUrl: './membres-fondateurs.scss',
})
export class MembresFondateurs {
  protected readonly i18n = inject(I18nService);
  protected readonly contactEmail = 'contact@oei-experts.org';

  // Only the index range is structural: the fee tier labels/amounts come from
  // `membresFondateurs.feeTiers.tiers.<index>.{label,amount}` (see home.ts's
  // `commitmentIndexes` for the same pattern).
  protected readonly feeTierIndexes = Array.from({ length: FEE_TIER_COUNT }, (_, i) => i);
}
