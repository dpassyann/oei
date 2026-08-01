import { TestBed } from '@angular/core/testing';
import { APropos } from './a-propos';

describe('APropos', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndVisionMissionCopy', () => {
    TestBed.configureTestingModule({ imports: [APropos] });
    const fixture = TestBed.createComponent(APropos);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('À propos');
    expect(compiled.textContent).toContain('Vision');
    expect(compiled.textContent).toContain('Mission');
  });
});
