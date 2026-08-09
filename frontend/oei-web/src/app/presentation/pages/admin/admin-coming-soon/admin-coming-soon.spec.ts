import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AdminComingSoon } from './admin-coming-soon';
import { I18nService } from '../../../i18n/i18n.service';

describe('AdminComingSoon', () => {
  it('givenSectionData_whenCreated_thenBuildsKeysFromSection', () => {
    TestBed.configureTestingModule({
      imports: [AdminComingSoon],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ section: 'menus' }) } },
        { provide: I18nService, useValue: { translate: (key: string) => key, translateList: () => ['Éditeur de menus', 'Réordonnancement drag & drop'] } },
      ],
    });

    const fixture = TestBed.createComponent(AdminComingSoon);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('admin.comingSoon.menus.title');
    expect(compiled.querySelectorAll('li').length).toBe(2);
  });
});
