import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-actualites',
  templateUrl: './actualites.html',
  styleUrl: './actualites.scss',
})
export class Actualites {
  protected readonly i18n = inject(I18nService);
}
