import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from '../../../i18n/i18n.service';

interface EspaceInstitutionNavLink {
  readonly labelKey: string;
  readonly routerLink: readonly string[];
  readonly exact: boolean;
}

// Menu latéral persistant de `/espace-institution` — jusqu'ici chaque sous-page
// (dashboard/membres/publications/opportunites) n'était reliée que par le lien du header vers la
// racine, sans moyen de naviguer d'une sous-page à l'autre. Ce composant devient le `component`
// de la route parent dans `app.routes.ts` et porte le `<router-outlet>` des sous-routes, sur le
// modèle visuel de `FloatingSideMenu` (navy/gold) mais en menu de section fixe plutôt qu'ancre
// de page.
@Component({
  selector: 'oei-espace-institution-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './espace-institution-layout.html',
  styleUrl: './espace-institution-layout.scss',
})
export class EspaceInstitutionLayout {
  protected readonly i18n = inject(I18nService);

  protected readonly links: readonly EspaceInstitutionNavLink[] = [
    { labelKey: 'espaceInstitution.nav.dashboard', routerLink: ['/espace-institution'], exact: true },
    { labelKey: 'espaceInstitution.nav.membres', routerLink: ['/espace-institution', 'membres'], exact: false },
    { labelKey: 'espaceInstitution.nav.publications', routerLink: ['/espace-institution', 'publications'], exact: false },
    { labelKey: 'espaceInstitution.nav.opportunites', routerLink: ['/espace-institution', 'opportunites'], exact: false },
  ];
}
