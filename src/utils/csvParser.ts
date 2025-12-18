import Papa from 'papaparse';
import { CryptoTransaction, ASXTransaction, FileType } from '../types';
import { detectFileType, getFinancialYear } from './fileDetector';

interface ParseResult {
  fileType: FileType;
  cryptoTransactions?: CryptoTransaction[];
  asxTransactions?: ASXTransaction[];
  error?: string;
}

/**
 * Parse a CSV file and return typed transactions
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    // First, read the file as text to handle CommSec multi-line headers
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve({
          fileType: 'unknown',
          error: 'Failed to read file',
        });
        return;
      }

      // Check if this is a CommSec file by looking for the header row
      const lines = text.split('\n');
      let headerLineIndex = -1;

      // Find the line that contains the actual CSV headers
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i];
        // Look for the header row with Code,Company,Date,Type or Transaction Date,Type,Market
        if (line.includes('Code') && line.includes('Company') && line.includes('Date') && line.includes('Type')) {
          headerLineIndex = i;
          break;
        } else if (line.includes('Transaction Date') && line.includes('Market') && line.includes('Total AUD')) {
          headerLineIndex = i;
          break;
        }
      }

      let csvData = text;

      // If we found a header line, extract only the relevant data
      if (headerLineIndex !== -1) {
        console.log('Found header at line:', headerLineIndex);
        // Get everything from the header line onwards
        csvData = lines.slice(headerLineIndex).join('\n');

        // Remove footer content (everything after blank line following data)
        const dataLines = csvData.split('\n');
        let lastDataIndex = dataLines.length;

        // Find where the actual transaction data ends
        for (let i = 1; i < dataLines.length; i++) {
          const line = dataLines[i].trim();
          // Stop at lines that start with quotes and contain long text (disclaimers)
          if (line.startsWith('"The transaction summary') ||
              line.startsWith('"GLOSSARY"') ||
              line === '' && i > 5) {
            lastDataIndex = i;
            break;
          }
        }

        csvData = dataLines.slice(0, lastDataIndex).join('\n');
      }

      console.log('Processing CSV data, first 200 chars:', csvData.substring(0, 200));

      // Now parse with PapaParse
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().replace(/^"|"$/g, ''),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            // Don't fail on minor errors, continue if we have data
            if (!results.data || results.data.length === 0) {
              resolve({
                fileType: 'unknown',
                error: `CSV parsing error: ${results.errors[0].message}`,
              });
              return;
            }
          }

          const headers = results.meta.fields || [];
          console.log('Parsed headers:', headers);

          const fileType = detectFileType(headers);
          console.log('Detected file type:', fileType);

          if (fileType === 'crypto') {
            const transactions = parseCryptoTransactions(results.data as Record<string, string>[]);
            console.log('Parsed crypto transactions:', transactions.length);
            resolve({
              fileType: 'crypto',
              cryptoTransactions: transactions,
            });
          } else if (fileType === 'asx') {
            const transactions = parseASXTransactions(results.data as Record<string, string>[]);
            console.log('Parsed ASX transactions:', transactions.length);

            if (transactions.length === 0) {
              resolve({
                fileType: 'asx',
                asxTransactions: [],
                error: 'No transactions found in this file. The file may contain no transaction data for this period.',
              });
              return;
            }

            resolve({
              fileType: 'asx',
              asxTransactions: transactions,
            });
          } else {
            console.error('Unknown file format. Headers found:', headers);
            resolve({
              fileType: 'unknown',
              error: 'Unable to detect file format. Please upload a CoinSpot or CommSec CSV file.',
            });
          }
        },
        error: (error: Error) => {
          console.error('Papa Parse error:', error);
          resolve({
            fileType: 'unknown',
            error: `Failed to parse CSV: ${error.message}`,
          });
        },
      });
    };

    reader.onerror = () => {
      resolve({
        fileType: 'unknown',
        error: 'Failed to read file',
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Parse CoinSpot crypto transactions
 */
function parseCryptoTransactions(data: Record<string, string>[]): CryptoTransaction[] {
  const transactions: CryptoTransaction[] = [];

  for (const row of data) {
    try {
      // Parse date: "DD/MM/YYYY HH:MM AM/PM"
      const dateStr = row['Transaction Date'] || row['Date'];
      if (!dateStr) continue;

      const date = parseCoinSpotDate(dateStr);
      if (!date) continue;

      const market = row['Market'] || '';
      const [coin, quote] = market.split('/');

      // Skip non-AUD transactions
      if (quote !== 'AUD') continue;

      const type = row['Type'] as 'Buy' | 'Sell';
      if (type !== 'Buy' && type !== 'Sell') continue;

      const amount = parseNumber(row['Amount']);
      const rateIncFee = parseNumber(row['Rate inc. fee'] || row['Rate inc fee']);
      const totalAUD = parseNumber(row['Total AUD']?.replace(' AUD', ''));
      const feeAUD = parseNumber(row['Fee AUD (inc GST)']?.replace(' AUD', ''));

      if (amount <= 0 || totalAUD <= 0) continue;

      transactions.push({
        transactionDate: date,
        type,
        market,
        coin,
        quote,
        amount,
        rateIncFee,
        totalAUD,
        feeAUD,
        financialYear: getFinancialYear(date),
      });
    } catch (e) {
      console.warn('Failed to parse row:', row, e);
    }
  }

  // Sort by date ascending
  return transactions.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());
}

/**
 * Parse CommSec ASX transactions
 */
function parseASXTransactions(data: Record<string, string>[]): ASXTransaction[] {
  const transactions: ASXTransaction[] = [];

  for (const row of data) {
    try {
      const code = row['Code']?.replace(/"/g, '').trim();
      if (!code) continue;

      // Skip summary rows and footer content
      if (code.toLowerCase().includes('total') ||
          code.toLowerCase().includes('glossary') ||
          code === '') continue;

      const dateStr = row['Date'];
      if (!dateStr || dateStr.trim() === '') continue;

      const date = parseASXDate(dateStr);
      if (!date) continue;

      const typeRaw = row['Type']?.trim();
      const type = typeRaw as 'Buy' | 'Sell';
      if (type !== 'Buy' && type !== 'Sell') continue;

      // Parse quantity - handle negative values for sells
      const quantityRaw = parseNumber(row['Quantity']);
      const quantity = Math.abs(quantityRaw);

      const unitPrice = Math.abs(parseNumber(row['Unit Price ($)']));
      const tradeValue = Math.abs(parseNumber(row['Trade Value ($)']));
      const brokerage = Math.abs(parseNumber(row['Brokerage+GST ($)']));
      const totalValue = Math.abs(parseNumber(row['Total Value ($)']));

      if (quantity <= 0) continue;

      console.log(`Parsed ${type} transaction: ${code} x ${quantity} @ $${unitPrice} on ${dateStr}`);

      transactions.push({
        code,
        company: row['Company']?.replace(/"/g, '').trim() || code,
        date,
        type,
        quantity,
        unitPrice,
        tradeValue,
        brokerage,
        totalValue,
        financialYear: getFinancialYear(date),
      });
    } catch (e) {
      console.warn('Failed to parse row:', row, e);
    }
  }

  // Sort by date ascending
  return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Parse CoinSpot date format: "DD/MM/YYYY HH:MM AM/PM"
 */
function parseCoinSpotDate(dateStr: string): Date | null {
  try {
    // Try "DD/MM/YYYY HH:MM AM/PM" format
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      const [, day, month, year, hours, minutes, ampm] = match;
      let hour = parseInt(hours);
      if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes));
    }

    // Try "DD/MM/YYYY" format
    const simpleMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (simpleMatch) {
      const [, day, month, year] = simpleMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse ASX date format: "DD/MM/YYYY"
 */
function parseASXDate(dateStr: string): Date | null {
  try {
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) {
      const [, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse a number from string, handling commas and currency symbols
 */
function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
