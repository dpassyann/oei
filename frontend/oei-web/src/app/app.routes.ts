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
import { DomaineDetail } from './presentation/pages/domaine-detail/domaine-detail';
import { institutionAccessGuard } from './presentation/auth/institution-access.guard';
import { InstitutionDashboard } from './presentation/pages/espace-institution/dashboard/dashboard';
import { InstitutionMembers } from './presentation/pages/espace-institution/membres/membres';
import { InstitutionPublicationsPage } from './presentation/pages/espace-institution/publications/publications';
import { InstitutionOpportunitiesPage } from './presentation/pages/espace-institution/opportunites/opportunites';
import { InstitutionPublique } from './presentation/pages/institution-publique/institution-publique';
import { CmsContentList } from './presentation/pages/cms/cms-content-list/cms-content-list';
import { CmsContentEditor } from './presentation/pages/cms/cms-content-editor/cms-content-editor';
import { CmsContributions } from './presentation/pages/cms/cms-contributions/cms-contributions';
import { cmsGuard } from './presentation/auth/cms.guard';

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
  { path: 'domaines/:slug', component: DomaineDetail },
  { path: 'contact', component: Contact },
  { path: 'membres-fondateurs', component: MembresFondateurs },
  { path: 'mentions-legales', component: MentionsLegales },
  { path: 'plan-du-site', component: PlanDuSite },
  // Espace membre institutionnel (doc 03) — route racine protégée par un garde simple basé sur
  // KeycloakAuthService (voir `institution-access.guard.ts`). La page publique institutionnelle
  // (`/institutions/:slug`) reste, elle, accessible sans authentification (doc 03 §"Page publique").
  {
    path: 'espace-institution',
    canActivate: [institutionAccessGuard],
    children: [
      { path: '', component: InstitutionDashboard },
      { path: 'membres', component: InstitutionMembers },
      { path: 'publications', component: InstitutionPublicationsPage },
      { path: 'opportunites', component: InstitutionOpportunitiesPage },
    ],
  },
  { path: 'institutions/:slug', component: InstitutionPublique },
  {
    path: 'cms',
    canActivate: [cmsGuard],
    children: [
      { path: '', component: CmsContentList },
      { path: 'contributions', component: CmsContributions },
      { path: ':id', component: CmsContentEditor },
    ],
  },
];
