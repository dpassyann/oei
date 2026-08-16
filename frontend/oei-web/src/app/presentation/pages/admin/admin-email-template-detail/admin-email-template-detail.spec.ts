import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminEmailTemplateDetail } from './admin-email-template-detail';
import { AdminEmailTemplatesApplicationService } from '../../../../application/service/admin-email-templates-application.service';
import { createEmailTemplate } from '../../../../domain/model/admin/admin-email-template';

describe('AdminEmailTemplateDetail', () => {
  it('givenTemplate_whenCreated_thenRendersNameAndSubjectField', async () => {
    const template = createEmailTemplate({
      id: 't1',
      name: 'Confirmation de paiement',
      subjectKey: 'admin.emailTemplates.samples.paymentConfirmation.subject',
      body: 'Bonjour {{memberName}}',
      variables: ['{{memberName}}'],
    });

    TestBed.configureTestingModule({
      imports: [AdminEmailTemplateDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 't1' })) },
        },
        {
          provide: AdminEmailTemplatesApplicationService,
          useValue: { getById: () => of(template), renderPreview: (t: typeof template) => t.body },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminEmailTemplateDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(html).toContain('Confirmation de paiement');
  });
});
