import { describe, expect, it } from 'vitest';
import { detectCardBrand, formatCardExpiry, formatCardNumber, isValidCardCvc, isValidCardExpiry, isValidCardNumber } from './card-number';

describe('detectCardBrand', () => {
  it('givenVisaPrefix_whenDetecting_thenReturnsVisa', () => {
    expect(detectCardBrand('4242424242424242')).toBe('VISA');
  });

  it('givenMastercardPrefix_whenDetecting_thenReturnsMastercard', () => {
    expect(detectCardBrand('5500000000000004')).toBe('MASTERCARD');
  });

  it('givenNewMastercardRangePrefix_whenDetecting_thenReturnsMastercard', () => {
    expect(detectCardBrand('2223000048400011')).toBe('MASTERCARD');
  });

  it('givenAmexPrefix_whenDetecting_thenReturnsAmex', () => {
    expect(detectCardBrand('378282246310005')).toBe('AMEX');
  });

  it('givenJcbPrefix_whenDetecting_thenReturnsJcb', () => {
    expect(detectCardBrand('3566002020360505')).toBe('JCB');
  });

  it('givenUnknownPrefix_whenDetecting_thenReturnsUnknown', () => {
    expect(detectCardBrand('9999999999999999')).toBe('UNKNOWN');
  });

  it('givenEmptyInput_whenDetecting_thenReturnsUnknown', () => {
    expect(detectCardBrand('')).toBe('UNKNOWN');
  });
});

describe('formatCardNumber', () => {
  it('givenVisaDigits_whenFormatting_thenGroupsByFour', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('givenAmexDigits_whenFormatting_thenGroupsFourSixFive', () => {
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
  });

  it('givenNonDigitCharacters_whenFormatting_thenStripsThem', () => {
    expect(formatCardNumber('4242-4242 4242.4242abc')).toBe('4242 4242 4242 4242');
  });

  it('givenTooManyDigits_whenFormatting_thenCapsAtBrandLength', () => {
    expect(formatCardNumber('42424242424242429999')).toBe('4242 4242 4242 4242');
  });
});

describe('isValidCardNumber', () => {
  it('givenValidLuhnNumber_whenValidating_thenReturnsTrue', () => {
    expect(isValidCardNumber('4242 4242 4242 4242')).toBe(true);
  });

  it('givenInvalidLuhnNumber_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardNumber('4242 4242 4242 4241')).toBe(false);
  });

  it('givenTooShortNumber_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardNumber('4242')).toBe(false);
  });
});

describe('formatCardExpiry', () => {
  it('givenFourDigits_whenFormatting_thenInsertsSlash', () => {
    expect(formatCardExpiry('1228')).toBe('12/28');
  });

  it('givenTwoDigits_whenFormatting_thenKeepsAsIs', () => {
    expect(formatCardExpiry('12')).toBe('12');
  });

  it('givenNonDigitCharacters_whenFormatting_thenStripsThem', () => {
    expect(formatCardExpiry('12/28')).toBe('12/28');
  });
});

describe('isValidCardExpiry', () => {
  const referenceDate = new Date('2026-08-15T00:00:00Z');

  it('givenFutureMonth_whenValidating_thenReturnsTrue', () => {
    expect(isValidCardExpiry('09/26', referenceDate)).toBe(true);
  });

  it('givenCurrentMonth_whenValidating_thenReturnsTrue', () => {
    expect(isValidCardExpiry('08/26', referenceDate)).toBe(true);
  });

  it('givenPastMonth_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardExpiry('07/26', referenceDate)).toBe(false);
  });

  it('givenInvalidMonth_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardExpiry('13/26', referenceDate)).toBe(false);
  });

  it('givenMalformedValue_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardExpiry('1226', referenceDate)).toBe(false);
  });
});

describe('isValidCardCvc', () => {
  it('givenThreeDigitsForVisa_whenValidating_thenReturnsTrue', () => {
    expect(isValidCardCvc('123', 'VISA')).toBe(true);
  });

  it('givenThreeDigitsForAmex_whenValidating_thenReturnsFalse', () => {
    expect(isValidCardCvc('123', 'AMEX')).toBe(false);
  });

  it('givenFourDigitsForAmex_whenValidating_thenReturnsTrue', () => {
    expect(isValidCardCvc('1234', 'AMEX')).toBe(true);
  });
});
