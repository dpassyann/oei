import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FloatingSideMenuLink {
  readonly label: string;
  readonly fragment: string;
}

// Generic floating/sticky in-page navigation, reused by every "univers de domaine" detail
// page (and any future page needing the same pattern) — the caller supplies its own list of
// section links, this component only renders and positions them.
@Component({
  selector: 'oei-floating-side-menu',
  imports: [RouterLink],
  templateUrl: './floating-side-menu.html',
  styleUrl: './floating-side-menu.scss',
})
export class FloatingSideMenu {
  readonly links = input.required<readonly FloatingSideMenuLink[]>();
  readonly title = input<string>('');
}
