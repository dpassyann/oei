import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

const LEVEL_COUNT = 6;

@Component({
  selector: 'oei-certifications',
  templateUrl: './certifications.html',
  styleUrl: './certifications.scss',
})
export class Certifications {
  protected readonly i18n = inject(I18nService);

  // Only the index range is structural here: the 6 expertise-level labels
  // themselves come from `certifications.levels.<index>` (see home.ts's
  // `commitmentIndexes` for the same pattern).
  protected readonly levelIndexes = Array.from({ length: LEVEL_COUNT }, (_, i) => i);
}
