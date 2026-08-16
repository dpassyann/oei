import { firstValueFrom } from 'rxjs';
import { AdminEmailTemplatesMockAdapter, resetAdminEmailTemplatesFixtures } from './admin-email-templates-mock.adapter';

describe('AdminEmailTemplatesMockAdapter', () => {
  beforeEach(() => resetAdminEmailTemplatesFixtures());

  it('whenList_thenReturnsSeedTemplates', async () => {
    const adapter = new AdminEmailTemplatesMockAdapter();
    const templates = await firstValueFrom(adapter.list());
    expect(templates.length).toBeGreaterThanOrEqual(5);
  });

  it('givenExistingId_whenUpdate_thenReturnsUpdatedTemplateAndPersistsInList', async () => {
    const adapter = new AdminEmailTemplatesMockAdapter();
    const updated = await firstValueFrom(
      adapter.update('tpl-payment-confirmation', { subjectKey: 'x', body: 'New body', active: false }),
    );
    expect(updated.body).toBe('New body');
    expect(updated.active).toBe(false);

    const fetched = await firstValueFrom(adapter.getById('tpl-payment-confirmation'));
    expect(fetched.body).toBe('New body');
  });

  it('givenUnknownId_whenGetById_thenThrows', async () => {
    const adapter = new AdminEmailTemplatesMockAdapter();
    await expect(firstValueFrom(adapter.getById('missing'))).rejects.toThrow();
  });
});
