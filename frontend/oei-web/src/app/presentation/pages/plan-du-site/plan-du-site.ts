import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';

interface SiteLink {
  // `key` is the structural identifier used to build the i18n path
  // `planDuSite.links.<key>` — the label itself is never hardcoded here.
  readonly key: string;
  readonly path: string;
}

@Component({
  selector: 'oei-plan-du-site',
  imports: [RouterLink],
  templateUrl: './plan-du-site.html',
  styleUrl: './plan-du-site.scss',
})
export class PlanDuSite {
  protected readonly i18n = inject(I18nService);

  protected readonly links: readonly SiteLink[] = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/a-propos' },
    { key: 'missions', path: '/nos-missions' },
    { key: 'ethics', path: '/deontologie' },
    { key: 'certifications', path: '/certifications' },
    { key: 'resources', path: '/ressources' },
    { key: 'whitePaper', path: '/livre-blanc' },
    { key: 'news', path: '/actualites' },
    { key: 'publications', path: '/publications' },
    { key: 'partners', path: '/partenaires' },
    { key: 'contact', path: '/contact' },
    { key: 'foundingMembers', path: '/membres-fondateurs' },
    { key: 'legalNotices', path: '/mentions-legales' },
    { key: 'sitemap', path: '/plan-du-site' },
  ];
}
