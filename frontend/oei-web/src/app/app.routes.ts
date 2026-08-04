import { Routes } from '@angular/router';
import { Home } from './presentation/pages/home/home';
import { APropos } from './presentation/pages/a-propos/a-propos';
import { NosMissions } from './presentation/pages/nos-missions/nos-missions';
import { Deontologie } from './presentation/pages/deontologie/deontologie';
import { Certifications } from './presentation/pages/certifications/certifications';
import { Ressources } from './presentation/pages/ressources/ressources';
import { Actualites } from './presentation/pages/actualites/actualites';
import { Contact } from './presentation/pages/contact/contact';
import { MentionsLegales } from './presentation/pages/mentions-legales/mentions-legales';
import { PlanDuSite } from './presentation/pages/plan-du-site/plan-du-site';
import { MembresFondateurs } from './presentation/pages/membres-fondateurs/membres-fondateurs';
import { Publications } from './presentation/pages/publications/publications';
import { Partenaires } from './presentation/pages/partenaires/partenaires';
import { PartenaireDetail } from './presentation/pages/partenaire-detail/partenaire-detail';
import { memberSpaceGuard } from './presentation/auth/member-space.guard';
import { Onboarding } from './presentation/pages/espace-membre/onboarding/onboarding';
import { Profil } from './presentation/pages/espace-membre/profil/profil';
import { CvBuilder } from './presentation/pages/espace-membre/cv-builder/cv-builder';
import { Badges } from './presentation/pages/espace-membre/badges/badges';
import { CarteNumerique } from './presentation/pages/espace-membre/carte/carte-numerique';
import { ProfilPublic } from './presentation/pages/espace-membre/profil-public/profil-public';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'a-propos', component: APropos },
  { path: 'nos-missions', component: NosMissions },
  { path: 'deontologie', component: Deontologie },
  { path: 'certifications', component: Certifications },
  { path: 'ressources', component: Ressources },
  { path: 'actualites', component: Actualites },
  { path: 'publications', component: Publications },
  { path: 'partenaires', component: Partenaires },
  { path: 'partenaires/:id', component: PartenaireDetail },
  { path: 'contact', component: Contact },
  { path: 'membres-fondateurs', component: MembresFondateurs },
  { path: 'mentions-legales', component: MentionsLegales },
  { path: 'plan-du-site', component: PlanDuSite },
  // Espace membre individuel (docs/adr/0002-v2-foundations.md, .prompt/plan/02-...):
  // guarded by `memberSpaceGuard` (mocked auth state, see KeycloakAuthService). The
  // public-profile page is intentionally NOT under this guard — it's public by design.
  {
    path: 'espace-membre',
    canActivate: [memberSpaceGuard],
    children: [
      { path: '', redirectTo: 'profil', pathMatch: 'full' },
      { path: 'inscription', component: Onboarding },
      { path: 'profil', component: Profil },
      { path: 'cv', component: CvBuilder },
      { path: 'badges', component: Badges },
      { path: 'carte', component: CarteNumerique },
    ],
  },
  { path: 'membres/:publicSlug', component: ProfilPublic },
];
