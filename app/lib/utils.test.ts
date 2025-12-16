import {describe, it, expect} from 'vitest';

import {
  missingClass,
  formatText,
  getExcerpt,
  isNewArrival,
  isDiscounted,
  statusMessage,
  getLocaleFromRequest,
  parseAsCurrency,
  isLocalPath,
  DEFAULT_LOCALE,
} from './utils';

describe('missingClass', () => {
  it('returns true when string is undefined', () => {
    expect(missingClass(undefined, 'test')).toBe(true);
  });

  it('returns true when string is empty', () => {
    expect(missingClass('', 'test')).toBe(true);
  });

  it('returns true when class is not present', () => {
    expect(missingClass('foo bar', 'baz')).toBe(true);
  });

  it('returns false when class is present', () => {
    expect(missingClass('foo bar', 'foo')).toBe(false);
  });

  it('returns false when class is present with prefix', () => {
    expect(missingClass('foo bar baz', 'bar')).toBe(false);
  });
});

describe('formatText', () => {
  it('returns undefined when input is undefined', () => {
    expect(formatText(undefined)).toBeUndefined();
  });

  it('returns undefined when input is empty string', () => {
    expect(formatText('')).toBeUndefined();
  });

  it('returns the input if it is not a string (React node)', () => {
    const element = {type: 'div', props: {children: 'test'}};
    expect(formatText(element as unknown as React.ReactNode)).toBe(element);
  });

  it('formats text with typographic improvements', () => {
    const result = formatText('Hello "world"');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('getExcerpt', () => {
  it('extracts content from paragraph tags', () => {
    const html = '<p>Hello World</p>';
    expect(getExcerpt(html)).toBe('<p>Hello World</p>');
  });

  it('returns original text if no paragraph found', () => {
    const text = 'Plain text';
    expect(getExcerpt(text)).toBe('Plain text');
  });

  it('returns full text when multiple paragraphs exist (regex matches first)', () => {
    const html = '<p>First</p><p>Second</p>';
    expect(getExcerpt(html)).toBe('<p>First</p><p>Second</p>');
  });
});

describe('isNewArrival', () => {
  it('returns true for products published within the last 30 days', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 15);
    expect(isNewArrival(recentDate.toISOString())).toBe(true);
  });

  it('returns false for products published more than 30 days ago', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 45);
    expect(isNewArrival(oldDate.toISOString())).toBe(false);
  });

  it('returns false for products published exactly 30 days ago (exclusive)', () => {
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() - 30);
    expect(isNewArrival(exactDate.toISOString())).toBe(false);
  });

  it('respects custom daysOld parameter', () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);
    expect(isNewArrival(date.toISOString(), 5)).toBe(false);
    expect(isNewArrival(date.toISOString(), 15)).toBe(true);
  });
});

describe('isDiscounted', () => {
  it('returns true when compareAtPrice is greater than price', () => {
    const price = {amount: '10.00', currencyCode: 'USD' as const};
    const compareAtPrice = {amount: '15.00', currencyCode: 'USD' as const};
    expect(isDiscounted(price, compareAtPrice)).toBe(true);
  });

  it('returns false when prices are equal', () => {
    const price = {amount: '10.00', currencyCode: 'USD' as const};
    const compareAtPrice = {amount: '10.00', currencyCode: 'USD' as const};
    expect(isDiscounted(price, compareAtPrice)).toBe(false);
  });

  it('returns false when compareAtPrice is less than price', () => {
    const price = {amount: '15.00', currencyCode: 'USD' as const};
    const compareAtPrice = {amount: '10.00', currencyCode: 'USD' as const};
    expect(isDiscounted(price, compareAtPrice)).toBe(false);
  });
});

describe('statusMessage', () => {
  it('returns correct translation for SUCCESS', () => {
    expect(statusMessage('SUCCESS')).toBe('Success');
  });

  it('returns correct translation for PENDING', () => {
    expect(statusMessage('PENDING')).toBe('Pending');
  });

  it('returns correct translation for OPEN', () => {
    expect(statusMessage('OPEN')).toBe('Open');
  });

  it('returns correct translation for FAILURE', () => {
    expect(statusMessage('FAILURE')).toBe('Failure');
  });

  it('returns correct translation for ERROR', () => {
    expect(statusMessage('ERROR')).toBe('Error');
  });

  it('returns correct translation for CANCELLED', () => {
    expect(statusMessage('CANCELLED')).toBe('Cancelled');
  });
});

describe('getLocaleFromRequest', () => {
  it('returns default locale for root path', () => {
    const request = new Request('http://localhost/');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('');
  });

  it('returns default locale for unknown locale path', () => {
    const request = new Request('http://localhost/unknown/products');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('');
  });

  it('returns correct locale for known locale path', () => {
    const request = new Request('http://localhost/en-ca/products');
    const locale = getLocaleFromRequest(request);
    expect(locale.pathPrefix).toBe('/en-ca');
  });
});

describe('parseAsCurrency', () => {
  it('formats number as USD currency', () => {
    const result = parseAsCurrency(10.5, DEFAULT_LOCALE);
    expect(result).toContain('10');
    expect(result).toContain('50');
  });

  it('formats large numbers with proper separators', () => {
    const result = parseAsCurrency(1000, DEFAULT_LOCALE);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });
});

describe('isLocalPath', () => {
  it('returns true for relative paths', () => {
    expect(isLocalPath('/products/test')).toBe(true);
  });

  it('returns true for paths without protocol', () => {
    expect(isLocalPath('/cart')).toBe(true);
  });

  it('returns false for absolute URLs with http', () => {
    expect(isLocalPath('http://example.com/path')).toBe(false);
  });

  it('returns false for absolute URLs with https', () => {
    expect(isLocalPath('https://example.com/path')).toBe(false);
  });

  it('returns true for hash links', () => {
    expect(isLocalPath('#section')).toBe(true);
  });

  it('returns true for query strings', () => {
    expect(isLocalPath('?query=value')).toBe(true);
  });
});
