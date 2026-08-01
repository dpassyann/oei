import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface SocialLink {
  readonly name: string;
  readonly href: string;
}

interface LegalLink {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'oei-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly currentYear = new Date().getFullYear();

  protected readonly partners: readonly string[] = ['IEEE', 'ACM', 'Inria', 'EPFL', 'UNESCO'];

  protected readonly socialLinks: readonly SocialLink[] = [
    { name: 'LinkedIn', href: '#' },
    { name: 'X', href: '#' },
    { name: 'YouTube', href: '#' },
    { name: 'Medium', href: '#' },
  ];

  protected readonly legalLinks: readonly LegalLink[] = [
    { label: 'Mentions légales', path: '/mentions-legales' },
    { label: 'Plan du site', path: '/plan-du-site' },
  ];
}
