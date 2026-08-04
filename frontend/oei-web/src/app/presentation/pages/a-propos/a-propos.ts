import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-a-propos',
  templateUrl: './a-propos.html',
  styleUrl: './a-propos.scss',
})
export class APropos {
  protected readonly i18n = inject(I18nService);
}
