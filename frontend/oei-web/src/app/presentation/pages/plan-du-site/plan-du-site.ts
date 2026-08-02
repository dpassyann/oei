import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SiteLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'oei-plan-du-site',
  imports: [RouterLink],
  templateUrl: './plan-du-site.html',
  styleUrl: './plan-du-site.scss',
})
export class PlanDuSite {
  protected readonly links: readonly SiteLink[] = [
    { label: 'Accueil', path: '/' },
    { label: 'À propos', path: '/a-propos' },
    { label: 'Nos missions', path: '/nos-missions' },
    { label: 'Déontologie', path: '/deontologie' },
    { label: 'Certifications', path: '/certifications' },
    { label: 'Ressources', path: '/ressources' },
    { label: 'Actualités', path: '/actualites' },
    { label: 'Contact', path: '/contact' },
    { label: 'Mentions légales', path: '/mentions-legales' },
    { label: 'Plan du site', path: '/plan-du-site' },
  ];
}
