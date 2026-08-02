import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlanDuSite } from './plan-du-site';

describe('PlanDuSite', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlanDuSite],
      providers: [provideRouter([])],
    });
  });

  it('givenComponent_whenCreated_thenRendersHeadingAndAllRouteLinks', () => {
    const fixture = TestBed.createComponent(PlanDuSite);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Plan du site');
    const links = compiled.querySelectorAll<HTMLAnchorElement>('.oei-page__link');
    expect(links.length).toBe(10);
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toBeTruthy();
    });
  });
});
