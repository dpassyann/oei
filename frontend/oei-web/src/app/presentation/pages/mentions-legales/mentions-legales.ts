import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-mentions-legales',
  templateUrl: './mentions-legales.html',
  styleUrl: './mentions-legales.scss',
})
export class MentionsLegales {
  protected readonly i18n = inject(I18nService);
}
