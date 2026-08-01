import { TestBed } from '@angular/core/testing';
import { MentionsLegales } from './mentions-legales';

describe('MentionsLegales', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndDoesNotAssertConstitutedLegalEntity', () => {
    TestBed.configureTestingModule({ imports: [MentionsLegales] });
    const fixture = TestBed.createComponent(MentionsLegales);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Mentions légales');
    expect(compiled.textContent).toContain('mouvement');
    expect(compiled.textContent).toContain('en cours de finalisation');
  });
});
