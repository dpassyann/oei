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

  it('givenKnownSlug_whenGetPublicCard_thenReturnsCardWithPublicDisplayFields', async () => {
    const adapter = new DigitalBusinessCardMockAdapter();
    const card = await firstValueFrom(adapter.getPublicCard('demo-jane-dupont'));
    expect(card?.displayName).toBeDefined();
    expect(card?.tier).toBe('SILVER');
    expect(card?.badges?.length).toBeGreaterThan(0);
  });

  it('givenUnknownSlug_whenGetPublicCard_thenReturnsNull', async () => {
    const adapter = new DigitalBusinessCardMockAdapter();
    const card = await firstValueFrom(adapter.getPublicCard('unknown-slug'));
    expect(card).toBeNull();
  });
});
