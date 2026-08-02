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

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'a-propos', component: APropos },
  { path: 'nos-missions', component: NosMissions },
  { path: 'deontologie', component: Deontologie },
  { path: 'certifications', component: Certifications },
  { path: 'ressources', component: Ressources },
  { path: 'actualites', component: Actualites },
  { path: 'contact', component: Contact },
  { path: 'mentions-legales', component: MentionsLegales },
  { path: 'plan-du-site', component: PlanDuSite },
];
