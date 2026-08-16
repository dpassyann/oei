import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ADMIN_EMAIL_TEMPLATES_PORT, EmailTemplateUpdateInput } from '../../domain/port/admin/admin-email-templates.port';
import { EmailTemplate } from '../../domain/model/admin/admin-email-template';

// Sample values used only to render a readable mock preview — never sent anywhere, never used by
// any real email-sending code path.
const SAMPLE_VALUES: Readonly<Record<string, string>> = {
  '{{memberName}}': 'Jeanne Dupont',
  '{{donorName}}': 'Jeanne Dupont',
  '{{amount}}': 'CHF 120.00',
  '{{itemLabel}}': 'Cotisation annuelle 2026',
  '{{invoiceReference}}': 'INV-2026-000123',
  '{{orderReference}}': 'ORD-2026-000456',
  '{{itemsList}}': 'Guide de certification (x1)',
  '{{donationDate}}': '10 août 2026',
  '{{memberNumber}}': 'OEI-2026-00789',
  '{{resetLink}}': 'https://oei.org/reset-password?token=…',
  '{{expiryMinutes}}': '30',
  '{{eventName}}': 'Sommet annuel OEI',
  '{{eventDate}}': '15 septembre 2026',
};

/**
 * Wraps `AdminEmailTemplatesPort` with the one non-trivial piece of logic this section needs:
 * rendering a `{{token}}`-substituted preview from sample data (task brief §CMS "templates
 * email": "aperçu basique du contenu"). This is a plain string substitution, not a real template
 * engine — the actual transactional emails are rendered server-side by Spring Boot (Thymeleaf),
 * never in this browser; this preview exists purely so an admin can sanity-check copy/variables
 * without needing backend access.
 */
@Service()
export class AdminEmailTemplatesApplicationService {
  private readonly port = inject(ADMIN_EMAIL_TEMPLATES_PORT);

  list(): Observable<EmailTemplate[]> {
    return this.port.list();
  }

  getById(id: string): Observable<EmailTemplate> {
    return this.port.getById(id);
  }

  update(id: string, input: EmailTemplateUpdateInput): Observable<EmailTemplate> {
    return this.port.update(id, input);
  }

  renderPreview(template: EmailTemplate): string {
    return template.variables.reduce(
      (text, token) => text.split(token).join(SAMPLE_VALUES[token] ?? token),
      template.body,
    );
  }
}
