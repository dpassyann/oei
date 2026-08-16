import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CmsLayout } from './cms-layout';

describe('CmsLayout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CmsLayout],
      providers: [provideRouter([])],
    });
  });

  it('givenLayout_whenCreated_thenRendersAllFourNavEntries', () => {
    const fixture = TestBed.createComponent(CmsLayout);
    fixture.detectChanges();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.oei-cms-shell__nav-link');
    expect(links.length).toBe(4);
  });

  it('givenLayout_whenCreated_thenNavLinksPointToEachCmsRoute', () => {
    const fixture = TestBed.createComponent(CmsLayout);
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.oei-cms-shell__nav-link'));
    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/cms', '/cms/contributions', '/cms/moderation', '/cms/events-moderation']);
  });

  it('givenLayout_whenCreated_thenRouterOutletIsPresent', () => {
    const fixture = TestBed.createComponent(CmsLayout);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('router-outlet')).toBeTruthy();
  });
});
