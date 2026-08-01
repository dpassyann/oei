import { TestBed } from '@angular/core/testing';
import { Certifications } from './certifications';

describe('Certifications', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndSixExpertiseLevels', () => {
    TestBed.configureTestingModule({ imports: [Certifications] });
    const fixture = TestBed.createComponent(Certifications);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Certifications');
    const levels = compiled.querySelectorAll('.oei-page__level');
    expect(levels.length).toBe(6);
    expect(compiled.textContent).toContain('Fellow');
  });
});
