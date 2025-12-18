// File types
export type FileType = 'crypto' | 'asx' | 'unknown';

// Crypto transaction (CoinSpot format)
export interface CryptoTransaction {
  transactionDate: Date;
  type: 'Buy' | 'Sell';
  market: string;
  coin: string;
  quote: string;
  amount: number;
  rateIncFee: number;
  totalAUD: number;
  feeAUD: number;
  financialYear: string;
}

// ASX transaction (CommSec format)
export interface ASXTransaction {
  code: string;
  company: string;
  date: Date;
  type: 'Buy' | 'Sell';
  quantity: number;
  unitPrice: number;
  tradeValue: number;
  brokerage: number;
  totalValue: number;
  financialYear: string;
}

// Inventory lot for FIFO
export interface InventoryLot {
  date: Date;
  quantityRemaining: number;
  originalQuantity: number;
  costPerUnit: number;
  totalCost: number;
  financialYear: string;
}

// CGT Event
export interface CGTEvent {
  disposalDate: Date;
  acquisitionDate: Date;
  asset: string;
  assetName?: string;
  quantity: number;
  proceeds: number;
  costBase: number;
  grossGainLoss: number;
  holdingDays: number;
  isLongTerm: boolean;
  discountEligible: boolean;
  discountPercentage: number;
  cgtDiscountAmount: number;
  netCapitalGain: number;
}

// Financial Year Summary
export interface FYSummary {
  fy: string;
  fyStart: Date;
  fyEnd: Date;
  events: CGTEvent[];
  totalProceeds: number;
  totalCostBase: number;
  shortTermGains: number;
  shortTermLosses: number;
  longTermGains: number;
  longTermLosses: number;
  grossCapitalGain: number;
  totalDiscount: number;
  netCapitalGain: number;
}

// Holding
export interface Holding {
  asset: string;
  assetName?: string;
  quantity: number;
  costBase: number;
  avgCost: number;
}

// Processing results
export interface ProcessingResult {
  success: boolean;
  fileType: FileType;
  ownerName: string;
  summaryByFY: FYSummary[];
  holdings: Holding[];
  totalTransactions: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  errors?: string[];
}

// PDF Report
export interface PDFReport {
  fy: string;
  blob: Blob;
  filename: string;
}
