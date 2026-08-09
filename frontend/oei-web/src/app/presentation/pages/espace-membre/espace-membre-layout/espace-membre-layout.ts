import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from '../../../i18n/i18n.service';

interface EspaceMembreNavLink {
  readonly path: string;
  readonly labelKey: string;
}

// Wraps every "day to day" espace-membre sub-page (profil/cv/badges/carte/cotisation/publier)
// with a persistent side menu — see `app.routes.ts`'s nested `espace-membre` children. Before
// this component existed, the only way to move between those sub-pages was the header's
// connected dropdown, which only ever linked to `/espace-membre/profil` — every other
// sub-route was reachable exclusively by typing the URL.
//
// `inscription` (the `Onboarding` wizard) is deliberately NOT nested under this layout: it's a
// full-screen, one-time step flow, not a page a member navigates back and forth to, so a
// permanent side menu around it would be visual noise rather than useful navigation.
@Component({
  selector: 'oei-espace-membre-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './espace-membre-layout.html',
  styleUrl: './espace-membre-layout.scss',
})
export class EspaceMembreLayout {
  protected readonly i18n = inject(I18nService);

  protected readonly navLinks: readonly EspaceMembreNavLink[] = [
    { path: 'profil', labelKey: 'espaceMembre.nav.profil' },
    { path: 'cv', labelKey: 'espaceMembre.nav.cv' },
    { path: 'badges', labelKey: 'espaceMembre.nav.badges' },
    { path: 'carte', labelKey: 'espaceMembre.nav.carte' },
    { path: 'cotisation', labelKey: 'espaceMembre.nav.cotisation' },
    { path: 'publier', labelKey: 'espaceMembre.nav.publier' },
    // Appended at the end, per this task's anti-conflict constraint — event proposal form
    // (docs "03-EVENTS-FEED-MODERATION-V2.md"), same "publier"-style flow as articles.
    { path: 'proposer-evenement', labelKey: 'espaceMembre.nav.proposerEvenement' },
  ];
}
