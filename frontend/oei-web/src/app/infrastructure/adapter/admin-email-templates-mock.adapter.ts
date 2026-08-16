import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AdminEmailTemplatesPort, EmailTemplateUpdateInput } from '../../domain/port/admin/admin-email-templates.port';
import { createEmailTemplate, EmailTemplate } from '../../domain/model/admin/admin-email-template';

// Seed set kept consistent with the transactional emails the backend chantier currently in
// progress is expected to send (payment/order/donation/membership confirmations) — see task
// brief §CMS "templates email". Purely illustrative: no template content here is wired to any
// real email-sending code path.
function buildSeedEmailTemplates(): EmailTemplate[] {
  return [
    createEmailTemplate({
      id: 'tpl-payment-confirmation',
      name: 'Confirmation de paiement',
      subjectKey: 'admin.emailTemplates.samples.paymentConfirmation.subject',
      body: 'Bonjour {{memberName}},\n\nNous confirmons la réception de votre paiement de {{amount}} pour {{itemLabel}}.\n\nRéférence : {{invoiceReference}}\n\nMerci de votre confiance,\nL\'équipe OEI',
      variables: ['{{memberName}}', '{{amount}}', '{{itemLabel}}', '{{invoiceReference}}'],
      active: true,
    }),
    createEmailTemplate({
      id: 'tpl-order-confirmation',
      name: 'Confirmation de commande (boutique)',
      subjectKey: 'admin.emailTemplates.samples.orderConfirmation.subject',
      body: 'Bonjour {{memberName}},\n\nVotre commande {{orderReference}} a bien été enregistrée.\n\nArticles : {{itemsList}}\nTotal : {{amount}}\n\nL\'équipe OEI',
      variables: ['{{memberName}}', '{{orderReference}}', '{{itemsList}}', '{{amount}}'],
      active: true,
    }),
    createEmailTemplate({
      id: 'tpl-donation-receipt',
      name: 'Reçu de don / contribution',
      subjectKey: 'admin.emailTemplates.samples.donationReceipt.subject',
      body: 'Bonjour {{donorName}},\n\nMerci pour votre don de {{amount}} en date du {{donationDate}}.\n\nCe message vaut reçu fiscal provisoire.\n\nL\'équipe OEI',
      variables: ['{{donorName}}', '{{amount}}', '{{donationDate}}'],
      active: true,
    }),
    createEmailTemplate({
      id: 'tpl-membership-welcome',
      name: 'Bienvenue adhésion',
      subjectKey: 'admin.emailTemplates.samples.membershipWelcome.subject',
      body: 'Bonjour {{memberName}},\n\nBienvenue au sein de l\'Ordre International des Experts de l\'Informatique !\n\nVotre numéro de membre : {{memberNumber}}\n\nL\'équipe OEI',
      variables: ['{{memberName}}', '{{memberNumber}}'],
      active: true,
    }),
    createEmailTemplate({
      id: 'tpl-password-reset',
      name: 'Réinitialisation de mot de passe',
      subjectKey: 'admin.emailTemplates.samples.passwordReset.subject',
      body: 'Bonjour {{memberName}},\n\nCliquez sur le lien suivant pour réinitialiser votre mot de passe : {{resetLink}}\n\nCe lien expire dans {{expiryMinutes}} minutes.\n\nL\'équipe OEI',
      variables: ['{{memberName}}', '{{resetLink}}', '{{expiryMinutes}}'],
      active: true,
    }),
    createEmailTemplate({
      id: 'tpl-event-registration',
      name: 'Confirmation d\'inscription à un événement',
      subjectKey: 'admin.emailTemplates.samples.eventRegistration.subject',
      body: 'Bonjour {{memberName}},\n\nVotre inscription à {{eventName}} le {{eventDate}} est confirmée.\n\nÀ bientôt,\nL\'équipe OEI',
      variables: ['{{memberName}}', '{{eventName}}', '{{eventDate}}'],
      active: false,
    }),
  ];
}

let templates: EmailTemplate[] = buildSeedEmailTemplates();

export function resetAdminEmailTemplatesFixtures(): void {
  templates = buildSeedEmailTemplates();
}

@Service()
export class AdminEmailTemplatesMockAdapter implements AdminEmailTemplatesPort {
  list(): Observable<EmailTemplate[]> {
    return of([...templates]);
  }

  getById(id: string): Observable<EmailTemplate> {
    const found = templates.find((template) => template.id === id);
    return found ? of(found) : throwError(() => new Error(`Email template "${id}" not found.`));
  }

  update(id: string, input: EmailTemplateUpdateInput): Observable<EmailTemplate> {
    const found = templates.find((template) => template.id === id);
    if (!found) {
      return throwError(() => new Error(`Email template "${id}" not found.`));
    }
    const updated = createEmailTemplate({ ...found, ...input });
    templates = templates.map((template) => (template.id === id ? updated : template));
    return of(updated);
  }
}
