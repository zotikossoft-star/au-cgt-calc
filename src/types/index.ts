// File types
export type FileType = 'crypto' | 'asx' | 'mixed' | 'unknown';

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

// Acquisition detail for CGT calculation
export interface AcquisitionDetail {
  date: Date;
  amount: number;
  cost: number;
  holdingDays: number;
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
  acquisitionDetails?: AcquisitionDetail[];
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

// Portfolio View Types (v2.0.0)
export type PortfolioScope = 'combined' | 'crypto' | 'asx';

export interface PortfolioMetrics {
  // Cost basis metrics (no market prices)
  totalInvested: number;
  totalRealizedGain: number;
  holdingsCount: number;

  // Historical
  totalTransactionCount: number;
  totalBuyTransactions: number;
  totalSellTransactions: number;
  avgHoldingPeriodDays: number;

  // Tax efficiency
  longTermEventsCount: number;
  shortTermEventsCount: number;
  longTermGainsPercent: number;
  totalCGTDiscount: number;
}

export interface AssetBreakdown {
  asset: string;
  assetName?: string;
  quantity: number;
  costBase: number;
  percentOfPortfolio: number;
}

export interface AssetPerformance {
  asset: string;
  assetName?: string;
  totalBought: number;
  totalSold: number;
  realizedGain: number;
  cgtDiscount: number;
  transactionCount: number;
  avgHoldingDays: number;
}

export interface PortfolioViewData {
  holdings: Holding[];
  metrics: PortfolioMetrics;
  assetBreakdown: AssetBreakdown[];
  performanceByAsset: AssetPerformance[];
  lastUpdated: Date;
}
