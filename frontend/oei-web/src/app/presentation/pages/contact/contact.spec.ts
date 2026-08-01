import { TestBed } from '@angular/core/testing';
import { Contact } from './contact';

describe('Contact', () => {
  it('givenComponent_whenCreated_thenRendersHeadingMailtoLinkAndFormPlannedNote', () => {
    TestBed.configureTestingModule({ imports: [Contact] });
    const fixture = TestBed.createComponent(Contact);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Contact');
    const link = compiled.querySelector<HTMLAnchorElement>('.oei-page__link');
    expect(link?.getAttribute('href')).toMatch(/^mailto:/);
    expect(compiled.querySelector('.oei-page__note')?.textContent).toContain('formulaire de contact');
  });
});
