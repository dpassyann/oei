import { TestBed } from '@angular/core/testing';
import { NosMissions } from './nos-missions';

describe('NosMissions', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndSixCommitments', () => {
    TestBed.configureTestingModule({ imports: [NosMissions] });
    const fixture = TestBed.createComponent(NosMissions);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Nos missions');
    const items = compiled.querySelectorAll('.oei-page__list-item');
    expect(items.length).toBe(6);
  });
});
