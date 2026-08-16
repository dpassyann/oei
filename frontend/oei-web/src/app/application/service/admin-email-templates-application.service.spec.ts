import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminEmailTemplatesApplicationService } from './admin-email-templates-application.service';
import { ADMIN_EMAIL_TEMPLATES_PORT } from '../../domain/port/admin/admin-email-templates.port';
import { createEmailTemplate } from '../../domain/model/admin/admin-email-template';

describe('AdminEmailTemplatesApplicationService', () => {
  function createService(): AdminEmailTemplatesApplicationService {
    TestBed.configureTestingModule({
      providers: [
        AdminEmailTemplatesApplicationService,
        { provide: ADMIN_EMAIL_TEMPLATES_PORT, useValue: { list: () => of([]), getById: () => of(null), update: () => of(null) } },
      ],
    });
    return TestBed.inject(AdminEmailTemplatesApplicationService);
  }

  it('givenTemplateWithTokens_whenRenderPreview_thenSubstitutesSampleValues', () => {
    const service = createService();
    const template = createEmailTemplate({
      id: 't1',
      body: 'Bonjour {{memberName}}, montant : {{amount}}.',
      variables: ['{{memberName}}', '{{amount}}'],
    });

    const preview = service.renderPreview(template);

    expect(preview).not.toContain('{{memberName}}');
    expect(preview).not.toContain('{{amount}}');
    expect(preview).toContain('Jeanne Dupont');
  });

  it('givenUnknownToken_whenRenderPreview_thenLeftUnsubstituted', () => {
    const service = createService();
    const template = createEmailTemplate({ id: 't2', body: 'Token: {{unknownToken}}', variables: ['{{unknownToken}}'] });

    expect(service.renderPreview(template)).toBe('Token: {{unknownToken}}');
  });
});
