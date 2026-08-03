import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-nos-missions',
  templateUrl: './nos-missions.html',
  styleUrl: './nos-missions.scss',
})
export class NosMissions {
  // Plain list of localized strings with no other structural data (no icon,
  // no route) — resolved directly via `translateList`, like `home.hero.checklist`.
  protected readonly i18n = inject(I18nService);
}
