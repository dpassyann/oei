import { firstValueFrom } from 'rxjs';
import { DigitalBusinessCardMockAdapter } from './digital-business-card-mock.adapter';

describe('DigitalBusinessCardMockAdapter', () => {
  it('givenDemoMember_whenGenerateCard_thenReturnsCardWithDemoSlug', async () => {
    const adapter = new DigitalBusinessCardMockAdapter();
    const card = await firstValueFrom(adapter.generateCard());
    expect(card.memberId).toBe('demo-member-1');
    expect(card.publicSlug).toBe('demo-jane-dupont');
    expect(card.qrCodeUrl).toBeDefined();
    expect(card.vCardUrl).toBeDefined();
  });
});
