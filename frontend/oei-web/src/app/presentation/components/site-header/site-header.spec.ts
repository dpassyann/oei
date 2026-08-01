import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SiteHeader],
      providers: [provideRouter([])],
    });
  });

  it('givenComponent_whenCreated_thenRendersEightNavLinksWithNonEmptyRouterLinks', () => {
    const fixture = TestBed.createComponent(SiteHeader);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-nav__link');

    expect(links.length).toBe(8);
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
});
