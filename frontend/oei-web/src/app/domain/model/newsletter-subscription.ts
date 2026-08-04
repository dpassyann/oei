// Fixed, structural enum of newsletter interest centres (doc 01, section 10). Rendered in the
// footer form purely from `footer.newsletter.interests.<key>` i18n keys — never a hardcoded label.
export type NewsletterInterest = 'cybersecurity' | 'ai' | 'ethics' | 'certification' | 'governance' | 'events';

export const NEWSLETTER_INTERESTS: readonly NewsletterInterest[] = [
  'cybersecurity',
  'ai',
  'ethics',
  'certification',
  'governance',
  'events',
];

export interface NewsletterSubscriptionRequest {
  readonly email: string;
  readonly lang: string;
  readonly interests: readonly NewsletterInterest[];
  readonly consent: boolean;
}

export interface NewsletterSubscriptionResult {
  // Double opt-in: the backend sends a confirmation email and only activates the
  // subscription once the visitor clicks the confirmation link — the subscription is
  // never immediately "active" from this call alone.
  readonly status: 'pendingConfirmation';
}
