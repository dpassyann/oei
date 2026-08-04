import { firstValueFrom } from 'rxjs';
import { NewsletterSubscriptionMockAdapter } from './newsletter-subscription-mock.adapter';

describe('NewsletterSubscriptionMockAdapter', () => {
  it('givenRequest_whenSubscribe_thenLogsGdprEntryAndResolvesPendingConfirmation', async () => {
    const adapter = new NewsletterSubscriptionMockAdapter();
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = await firstValueFrom(
      adapter.subscribe({ email: 'jane.doe@example.com', lang: 'fr', interests: ['ai'], consent: true }),
    );

    expect(result).toEqual({ status: 'pendingConfirmation' });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('jane.doe@example.com'));
  });
});
