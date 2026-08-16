// Pure card-number helpers for the mocked "Carte bancaire" tab of the cotisation checkout
// (`cotisation.ts`/`cotisation.html`). Format/brand-detection/Luhn-checksum only — this never
// validates a real card against a processor, and the raw digits typed here are NEVER sent to
// our backend (see the notice in `cotisation.html`).
//
// IMPORTANT — real API mode: once the backend's Stripe integration (`infrastructure-client`,
// built in parallel) is stabilized, this whole "Carte bancaire" tab must be replaced by Stripe
// Elements (`@stripe/stripe-js`), which captures and tokenizes the PAN directly in an iframe
// hosted by Stripe — a raw `<input>` for the card number is out of PCI-DSS scope for a merchant
// site. These pure functions (format/brand detection) can still be reused for a *display-only*
// last-4-digits chip if needed, but the digits themselves must never transit through our own
// component state in real mode.
export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'JCB' | 'UNKNOWN';

const AMEX_GROUPS = [4, 6, 5];
const DEFAULT_GROUPS = [4, 4, 4, 4];

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Detects the card brand from its leading digits (IIN ranges) — Visa (4…), Mastercard
 * (51-55 or the newer 2221-2720 range), Amex (34/37), JCB (3528-3589). Unknown otherwise. */
export function detectCardBrand(rawInput: string): CardBrand {
  const digits = digitsOnly(rawInput);
  if (digits.length === 0) {
    return 'UNKNOWN';
  }
  if (digits.startsWith('4')) {
    return 'VISA';
  }
  const twoDigitPrefix = Number(digits.slice(0, 2));
  if (digits.startsWith('3') && (twoDigitPrefix === 34 || twoDigitPrefix === 37)) {
    return 'AMEX';
  }
  const fourDigitPrefix = Number(digits.slice(0, 4));
  if (fourDigitPrefix >= 3528 && fourDigitPrefix <= 3589) {
    return 'JCB';
  }
  if (twoDigitPrefix >= 51 && twoDigitPrefix <= 55) {
    return 'MASTERCARD';
  }
  if (fourDigitPrefix >= 2221 && fourDigitPrefix <= 2720) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
}

/** Formats raw keystrokes into grouped-by-4 blocks (4-6-5 for Amex), stripping any
 * non-digit character and capping the length at the brand's real PAN length. */
export function formatCardNumber(rawInput: string): string {
  const brand = detectCardBrand(rawInput);
  const maxLength = brand === 'AMEX' ? 15 : 16;
  const digits = digitsOnly(rawInput).slice(0, maxLength);
  const groups = brand === 'AMEX' ? AMEX_GROUPS : DEFAULT_GROUPS;

  const parts: string[] = [];
  let cursor = 0;
  for (const groupSize of groups) {
    if (cursor >= digits.length) {
      break;
    }
    parts.push(digits.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }
  return parts.join(' ');
}

/** Luhn checksum — format-only client-side validation (no real processor call in mock mode). */
export function isValidCardNumber(rawInput: string): boolean {
  const digits = digitsOnly(rawInput);
  if (digits.length < 12) {
    return false;
  }
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Formats raw keystrokes for the expiry field into "MM/AA", auto-inserting the slash. */
export function formatCardExpiry(rawInput: string): string {
  const digits = digitsOnly(rawInput).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Whether "MM/AA" describes a calendar month that has not yet elapsed as of `referenceDate`. */
export function isValidCardExpiry(value: string, referenceDate: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }
  const currentYear = referenceDate.getUTCFullYear();
  const currentMonth = referenceDate.getUTCMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

/** Format-only CVC check: 3 digits (Visa/Mastercard/JCB) or 4 (Amex). */
export function isValidCardCvc(rawInput: string, brand: CardBrand): boolean {
  const digits = digitsOnly(rawInput);
  return brand === 'AMEX' ? digits.length === 4 : digits.length === 3;
}
