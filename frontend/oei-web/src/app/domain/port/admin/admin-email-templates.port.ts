import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailTemplate } from '../../model/admin/admin-email-template';

export interface EmailTemplateUpdateInput {
  readonly subjectKey: string;
  readonly body: string;
  readonly active: boolean;
}

/**
 * Admin CRUD for transactional email templates (task brief §CMS "templates email"). Matches, in
 * spirit, the backend email chantier currently in progress (payment/order/donation/membership
 * confirmations) without depending on it: no `/api/admin/v1/email-templates` endpoint exists yet
 * (see `AdminEmailTemplatesApiAdapter`'s doc comment) — real template rendering (Thymeleaf) stays
 * entirely server-side regardless of which adapter is wired in.
 */
export interface AdminEmailTemplatesPort {
  list(): Observable<EmailTemplate[]>;
  getById(id: string): Observable<EmailTemplate>;
  update(id: string, input: EmailTemplateUpdateInput): Observable<EmailTemplate>;
}

export const ADMIN_EMAIL_TEMPLATES_PORT = new InjectionToken<AdminEmailTemplatesPort>('AdminEmailTemplatesPort');
