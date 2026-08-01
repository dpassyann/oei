import { TestBed } from '@angular/core/testing';
import { Actualites } from './actualites';

describe('Actualites', () => {
  it('givenComponent_whenCreated_thenRendersHeadingAndEmptyStateMessage', () => {
    TestBed.configureTestingModule({ imports: [Actualites] });
    const fixture = TestBed.createComponent(Actualites);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.oei-page__title')?.textContent).toContain('Actualités');
    expect(compiled.querySelector('.oei-page__empty')?.textContent).toContain('Aucune actualité');
  });
});
