import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FeeTier {
  readonly label: string;
  readonly amount: string;
}

@Component({
  selector: 'oei-membres-fondateurs',
  imports: [RouterLink],
  templateUrl: './membres-fondateurs.html',
  styleUrl: './membres-fondateurs.scss',
})
export class MembresFondateurs {
  protected readonly contactEmail = 'contact@oei-experts.org';

  protected readonly feeTiers: readonly FeeTier[] = [
    { label: 'Étudiant', amount: '20 €' },
    { label: 'Membre', amount: '50 €' },
    { label: 'Membre fondateur', amount: '100 €' },
    { label: 'Membre soutien', amount: '250 €' },
  ];
}
