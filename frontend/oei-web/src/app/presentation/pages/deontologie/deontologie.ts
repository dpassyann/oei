import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-deontologie',
  templateUrl: './deontologie.html',
  styleUrl: './deontologie.scss',
})
export class Deontologie {
  protected readonly i18n = inject(I18nService);
}
