import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminEmailTemplatesPort, EmailTemplateUpdateInput } from '../../domain/port/admin/admin-email-templates.port';
import { EmailTemplate } from '../../domain/model/admin/admin-email-template';

// Speculative contract, same convention as `AdminMenusApiAdapter`: `/api/admin/v1/email-templates`
// does not exist in `openapi/oei-api.yaml` yet. Whichever backend service ends up owning the
// actual transactional-email chantier will render templates with a real engine (Thymeleaf) —
// this frontend never renders emails itself, in either adapter.
const ADMIN_EMAIL_TEMPLATES_API_BASE = '/api/admin/v1/email-templates';

@Service()
export class AdminEmailTemplatesApiAdapter implements AdminEmailTemplatesPort {
  private readonly http = inject(HttpClient);

  list(): Observable<EmailTemplate[]> {
    return this.http.get<EmailTemplate[]>(ADMIN_EMAIL_TEMPLATES_API_BASE);
  }

  getById(id: string): Observable<EmailTemplate> {
    return this.http.get<EmailTemplate>(`${ADMIN_EMAIL_TEMPLATES_API_BASE}/${id}`);
  }

  update(id: string, input: EmailTemplateUpdateInput): Observable<EmailTemplate> {
    return this.http.put<EmailTemplate>(`${ADMIN_EMAIL_TEMPLATES_API_BASE}/${id}`, input);
  }
}
