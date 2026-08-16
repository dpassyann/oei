// Transactional email template (task brief §CMS "templates email"). `subjectKey` is a dotted
// i18n key (never a hardcoded string) resolved through `I18nService.translate` for the FR
// preview; `body` is a plain mock preview string only — no real Thymeleaf rendering ever happens
// in this frontend (see `AdminEmailTemplatesApplicationService.renderPreview`'s doc comment).
export interface EmailTemplate {
  readonly id: string;
  readonly name: string;
  readonly subjectKey: string;
  readonly body: string;
  readonly variables: readonly string[];
  readonly active: boolean;
}

export function createEmailTemplate(input: Partial<EmailTemplate> & Pick<EmailTemplate, 'id'>): EmailTemplate {
  return {
    id: input.id,
    name: input.name ?? '',
    subjectKey: input.subjectKey ?? '',
    body: input.body ?? '',
    variables: input.variables ?? [],
    active: input.active ?? true,
  };
}
