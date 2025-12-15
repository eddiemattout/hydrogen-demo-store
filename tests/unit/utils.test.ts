import {describe, it, expect} from 'vitest';

import {formatPrice, normalizePrice} from '../utils';

describe('formatPrice', () => {
  describe('with default parameters (USD, en-US)', () => {
    it('formats a number correctly', () => {
      expect(formatPrice(1800)).toBe('$1,800.00');
    });

    it('formats a string number correctly', () => {
      expect(formatPrice('1800')).toBe('$1,800.00');
    });

    it('formats zero correctly', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('formats decimal numbers correctly', () => {
      expect(formatPrice(19.99)).toBe('$19.99');
    });

    it('formats large numbers correctly', () => {
      expect(formatPrice(1000000)).toBe('$1,000,000.00');
    });

    it('formats small decimal numbers correctly', () => {
      expect(formatPrice(0.01)).toBe('$0.01');
    });

    it('formats negative numbers correctly', () => {
      expect(formatPrice(-50)).toBe('-$50.00');
    });
  });

  describe('with different currencies', () => {
    it('formats EUR correctly', () => {
      const result = formatPrice(1800, 'EUR', 'en-US');
      expect(result).toContain('1,800.00');
    });

    it('formats GBP correctly', () => {
      const result = formatPrice(1800, 'GBP', 'en-US');
      expect(result).toContain('1,800.00');
    });

    it('formats JPY correctly (no decimals)', () => {
      const result = formatPrice(1800, 'JPY', 'en-US');
      expect(result).toContain('1,800');
    });
  });

  describe('with different locales', () => {
    it('formats with de-DE locale correctly', () => {
      const result = formatPrice(1800, 'EUR', 'de-DE');
      expect(result).toMatch(/1[.\s]800,00/);
    });

    it('formats with fr-FR locale correctly', () => {
      const result = formatPrice(1800, 'EUR', 'fr-FR');
      expect(result).toMatch(/1[\s\u202F]800,00/);
    });
  });
});

describe('normalizePrice', () => {
  describe('with valid US format prices', () => {
    it('normalizes $1,800.00 correctly', () => {
      expect(normalizePrice('$1,800.00')).toBe(1800);
    });

    it('normalizes $19.99 correctly', () => {
      expect(normalizePrice('$19.99')).toBe(19.99);
    });

    it('normalizes $0.00 correctly', () => {
      expect(normalizePrice('$0.00')).toBe(0);
    });

    it('normalizes price without dollar sign', () => {
      expect(normalizePrice('1,800.00')).toBe(1800);
    });

    it('normalizes simple number string', () => {
      expect(normalizePrice('100')).toBe(100);
    });

    it('normalizes price with cents only', () => {
      expect(normalizePrice('$0.99')).toBe(0.99);
    });

    it('normalizes large prices correctly', () => {
      expect(normalizePrice('$1,000,000.00')).toBe(1000000);
    });
  });

  describe('with European format prices', () => {
    it('normalizes 1.800,00 correctly', () => {
      expect(normalizePrice('1.800,00')).toBe(1800);
    });

    it('normalizes 19,99 correctly', () => {
      expect(normalizePrice('19,99')).toBe(19.99);
    });
  });

  describe('with edge cases', () => {
    it('throws error for null', () => {
      expect(() => normalizePrice(null)).toThrow('Price was not found');
    });

    it('throws error for empty string', () => {
      expect(() => normalizePrice('')).toThrow('Price was not found');
    });

    it('throws error for invalid string', () => {
      expect(() => normalizePrice('invalid')).toThrow('Price was not found');
    });

    it('throws error for string with letters', () => {
      expect(() => normalizePrice('$100abc')).toThrow('Price was not found');
    });

    it('throws error for string with special characters', () => {
      expect(() => normalizePrice('$100!')).toThrow('Price was not found');
    });
  });
});
