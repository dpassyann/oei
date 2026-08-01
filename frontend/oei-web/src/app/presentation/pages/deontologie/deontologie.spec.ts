import { TestBed } from '@angular/core/testing';
import { Deontologie } from './deontologie';

describe('Deontologie', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndCodeVsCharteDistinction', () => {
    TestBed.configureTestingModule({ imports: [Deontologie] });
    const fixture = TestBed.createComponent(Deontologie);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Déontologie');
    expect(compiled.textContent).toContain('code de déontologie');
    expect(compiled.textContent).toContain('charte');
  });
});
