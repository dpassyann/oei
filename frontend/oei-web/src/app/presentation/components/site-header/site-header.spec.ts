import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    });
  });

  it('givenComponent_whenCreated_thenRendersNineNavLinksWithNonEmptyRouterLinks', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-nav__link');

    expect(links.length).toBe(9);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    });
  });

  it('givenComponent_whenCreated_thenRendersLanguageSwitcherAndMemberAreaButton', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('oei-language-switcher')).toBeTruthy();
    expect(compiled.querySelector('.oei-cta-member')).toBeTruthy();
  });

  it('givenMemberAreaButton_whenClicked_thenNavigatesToEspaceMembre', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector<HTMLButtonElement>('.oei-cta-member');
    button?.click();

    expect(navigateSpy).toHaveBeenCalledWith('/espace-membre');
  });
});
