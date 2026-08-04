import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FloatingSideMenu } from './floating-side-menu';

describe('FloatingSideMenu', () => {
  it('givenLinks_whenCreated_thenRendersEachLinkWithItsFragment', () => {
    TestBed.configureTestingModule({
      imports: [FloatingSideMenu],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(FloatingSideMenu);
    fixture.componentRef.setInput('links', [
      { label: "Vue d'ensemble", fragment: 'apercu' },
      { label: 'Ressources', fragment: 'ressources' },
    ]);
    fixture.componentRef.setInput('title', 'Sur cette page');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Sur cette page');
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-floating-side-menu__link');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain("Vue d'ensemble");
    expect(links[1].getAttribute('href')).toContain('ressources');
  });
});
