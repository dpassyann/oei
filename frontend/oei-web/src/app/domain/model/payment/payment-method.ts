// Conceptually mirrors the backend's `PaymentMethod` enum strategy (`CARD` / `PAYPAL`,
// `infrastructure-client` module being built in parallel under `backend/`) — purely for
// naming consistency across the stack, no real coupling: the frontend never calls a
// stabilized payment endpoint yet, it only picks which mock/UI flow to render.
export type PaymentMethod = 'CARD' | 'PAYPAL';

export const PAYMENT_METHODS: readonly PaymentMethod[] = ['CARD', 'PAYPAL'];
