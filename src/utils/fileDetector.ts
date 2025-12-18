import { FileType } from '../types';

/**
 * Detect whether a CSV file is Crypto (CoinSpot) or ASX format
 */
export function detectFileType(headers: string[]): FileType {
  // Normalize headers: lowercase, trim, remove quotes
  const normalizedHeaders = headers.map(h => 
    h.toLowerCase().trim().replace(/"/g, '').replace(/'/g, '')
  );
  
  console.log('Detected headers:', normalizedHeaders); // Debug log
  
  // Crypto CSV indicators (CoinSpot format)
  // Headers: Transaction Date, Type, Market, Amount, Rate inc. fee, Total AUD, Fee AUD (inc GST)
  const cryptoIndicators = ['transaction date', 'market', 'total aud'];
  const hasCryptoHeaders = cryptoIndicators.every(indicator => 
    normalizedHeaders.some(h => h.includes(indicator) || indicator.includes(h))
  );
  
  // Additional check: must have 'market' column (unique to crypto)
  const hasMarketColumn = normalizedHeaders.some(h => h === 'market');
  
  if (hasCryptoHeaders && hasMarketColumn) {
    return 'crypto';
  }
  
  // ASX CSV indicators (CommSec/broker format)
  // Headers: Code, Company, Date, Type, Quantity, Unit Price ($), Trade Value ($), Brokerage+GST ($)
  const asxIndicators = ['code', 'company', 'quantity'];
  const hasASXHeaders = asxIndicators.every(indicator =>
    normalizedHeaders.some(h => h.includes(indicator) || h === indicator)
  );
  
  // Additional check: must have 'code' column (unique to ASX)
  const hasCodeColumn = normalizedHeaders.some(h => h === 'code');
  
  if (hasASXHeaders && hasCodeColumn) {
    return 'asx';
  }
  
  return 'unknown';
}

/**
 * Get the financial year string for a given date
 * Australian FY: 1 July - 30 June
 */
export function getFinancialYear(date: Date): string {
  const month = date.getMonth(); // 0-indexed
  const year = date.getFullYear();
  
  if (month >= 6) { // July (6) onwards
    return `FY${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `FY${year - 1}-${year.toString().slice(-2)}`;
  }
}

/**
 * Get date range for a financial year
 */
export function getFYDateRange(fyString: string): { start: Date; end: Date } {
  const startYear = parseInt(fyString.slice(2, 6));
  return {
    start: new Date(startYear, 6, 1), // 1 July
    end: new Date(startYear + 1, 5, 30, 23, 59, 59), // 30 June
  };
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}
