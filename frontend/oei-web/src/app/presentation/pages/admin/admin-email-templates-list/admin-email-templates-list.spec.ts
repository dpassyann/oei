import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminEmailTemplatesList } from './admin-email-templates-list';
import { AdminEmailTemplatesApplicationService } from '../../../../application/service/admin-email-templates-application.service';
import { createEmailTemplate } from '../../../../domain/model/admin/admin-email-template';

describe('AdminEmailTemplatesList', () => {
  it('givenTemplates_whenCreated_thenRendersOneRowPerTemplate', async () => {
    TestBed.configureTestingModule({
      imports: [AdminEmailTemplatesList],
      providers: [
        provideRouter([]),
        {
          provide: AdminEmailTemplatesApplicationService,
          useValue: { list: () => of([createEmailTemplate({ id: 't1', name: 'Confirmation' })]) },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminEmailTemplatesList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
  });
});
