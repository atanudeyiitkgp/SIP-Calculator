import { CurrencyCode, CurrencyConfig } from '../types/sip';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (INR)',
    locale: 'en-IN',
    defaultMonthly: 10000,
    defaultTarget: 5000000, // 50 Lakhs
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    locale: 'en-US',
    defaultMonthly: 500,
    defaultTarget: 500000,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    locale: 'de-DE',
    defaultMonthly: 400,
    defaultTarget: 400000,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    locale: 'en-GB',
    defaultMonthly: 350,
    defaultTarget: 350000,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    locale: 'en-CA',
    defaultMonthly: 600,
    defaultTarget: 600000,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (AUD)',
    locale: 'en-AU',
    defaultMonthly: 650,
    defaultTarget: 650000,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar (SGD)',
    locale: 'en-SG',
    defaultMonthly: 600,
    defaultTarget: 600000,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen (JPY)',
    locale: 'ja-JP',
    defaultMonthly: 50000,
    defaultTarget: 50000000,
  },
};

/**
 * Format currency with full precision and symbol
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const num = Math.round(amount);

  if (compact) {
    if (currencyCode === 'INR') {
      const absVal = Math.abs(num);
      if (absVal >= 10000000) {
        return `${config.symbol}${(num / 10000000).toFixed(2)} Cr`;
      }
      if (absVal >= 100000) {
        return `${config.symbol}${(num / 100000).toFixed(2)} L`;
      }
      if (absVal >= 1000) {
        return `${config.symbol}${(num / 1000).toFixed(1)}k`;
      }
      return `${config.symbol}${num}`;
    }

    const absVal = Math.abs(num);
    if (absVal >= 1000000000) {
      return `${config.symbol}${(num / 1000000000).toFixed(2)}B`;
    }
    if (absVal >= 1000000) {
      return `${config.symbol}${(num / 1000000).toFixed(2)}M`;
    }
    if (absVal >= 1000) {
      return `${config.symbol}${(num / 1000).toFixed(1)}k`;
    }
    return `${config.symbol}${num}`;
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `${config.symbol}${num.toLocaleString()}`;
  }
}

/**
 * Formats a plain number with commas appropriate for the currency
 */
export function formatNumber(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  try {
    return new Intl.NumberFormat(config.locale, {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return Math.round(amount).toLocaleString();
  }
}
