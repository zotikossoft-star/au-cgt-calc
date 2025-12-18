import {
  CryptoTransaction,
  ASXTransaction,
  CGTEvent,
  FYSummary,
  Holding,
  InventoryLot,
  ProcessingResult,
  FileType,
} from '../types';
import { getFYDateRange } from './fileDetector';

/**
 * Main CGT calculation function
 */
export function calculateCGT(
  fileType: FileType,
  cryptoTransactions?: CryptoTransaction[],
  asxTransactions?: ASXTransaction[],
  ownerName: string = 'Report'
): ProcessingResult {
  if (fileType === 'crypto' && cryptoTransactions) {
    return calculateCryptoCGT(cryptoTransactions, ownerName);
  } else if (fileType === 'asx' && asxTransactions) {
    return calculateASXCGT(asxTransactions, ownerName);
  }

  return {
    success: false,
    fileType: 'unknown',
    ownerName,
    summaryByFY: [],
    holdings: [],
    totalTransactions: 0,
    dateRange: { start: new Date(), end: new Date() },
    errors: ['Invalid file type or no transactions found'],
  };
}

/**
 * Calculate CGT for crypto transactions
 */
function calculateCryptoCGT(
  transactions: CryptoTransaction[],
  ownerName: string
): ProcessingResult {
  // FIFO inventory per coin
  const inventory: Map<string, InventoryLot[]> = new Map();
  
  // CGT events grouped by FY
  const cgtEventsByFY: Map<string, CGTEvent[]> = new Map();
  
  // Process each transaction
  for (const tx of transactions) {
    const coin = tx.coin;
    
    if (tx.type === 'Buy') {
      // Add to inventory
      const costPerUnit = tx.totalAUD / tx.amount;
      const lot: InventoryLot = {
        date: tx.transactionDate,
        quantityRemaining: tx.amount,
        originalQuantity: tx.amount,
        costPerUnit,
        totalCost: tx.totalAUD,
        financialYear: tx.financialYear,
      };
      
      if (!inventory.has(coin)) {
        inventory.set(coin, []);
      }
      inventory.get(coin)!.push(lot);
      
    } else if (tx.type === 'Sell') {
      // Match with FIFO lots
      const proceeds = tx.totalAUD;
      let amountToSell = tx.amount;
      let costBase = 0;
      const acquisitionDetails: { date: Date; amount: number; cost: number; holdingDays: number }[] = [];
      
      const coinLots = inventory.get(coin) || [];
      
      while (amountToSell > 0.000001 && coinLots.length > 0) {
        const oldestLot = coinLots[0];
        
        if (oldestLot.quantityRemaining <= 0.000001) {
          coinLots.shift();
          continue;
        }
        
        const lotAmountUsed = Math.min(amountToSell, oldestLot.quantityRemaining);
        const lotCost = lotAmountUsed * oldestLot.costPerUnit;
        const holdingDays = Math.floor(
          (tx.transactionDate.getTime() - oldestLot.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        acquisitionDetails.push({
          date: oldestLot.date,
          amount: lotAmountUsed,
          cost: lotCost,
          holdingDays,
        });
        
        costBase += lotCost;
        oldestLot.quantityRemaining -= lotAmountUsed;
        amountToSell -= lotAmountUsed;
        
        if (oldestLot.quantityRemaining <= 0.000001) {
          coinLots.shift();
        }
      }
      
      // Calculate gain/loss
      const grossGainLoss = proceeds - costBase;
      
      // Calculate discount eligibility
      const totalSold = acquisitionDetails.reduce((sum, d) => sum + d.amount, 0);
      const discountEligibleAmount = acquisitionDetails
        .filter(d => d.holdingDays > 365)
        .reduce((sum, d) => sum + d.amount, 0);
      const discountPercentage = totalSold > 0 ? discountEligibleAmount / totalSold : 0;
      
      const avgHoldingDays = totalSold > 0
        ? acquisitionDetails.reduce((sum, d) => sum + d.holdingDays * d.amount, 0) / totalSold
        : 0;
      const isLongTerm = avgHoldingDays > 365;
      
      // Apply 50% discount only to gains on long-term holdings
      let cgtDiscountAmount = 0;
      let netCapitalGain = grossGainLoss;
      
      if (grossGainLoss > 0 && discountPercentage > 0) {
        const discountEligibleGain = grossGainLoss * discountPercentage;
        cgtDiscountAmount = discountEligibleGain * 0.5;
        netCapitalGain = grossGainLoss - cgtDiscountAmount;
      }
      
      const earliestAcquisition = acquisitionDetails.length > 0
        ? acquisitionDetails.reduce((min, d) => d.date < min ? d.date : min, acquisitionDetails[0].date)
        : tx.transactionDate;
      
      const cgtEvent: CGTEvent = {
        disposalDate: tx.transactionDate,
        acquisitionDate: earliestAcquisition,
        asset: coin,
        quantity: tx.amount,
        proceeds,
        costBase,
        grossGainLoss,
        holdingDays: Math.round(avgHoldingDays),
        isLongTerm,
        discountEligible: discountPercentage > 0,
        discountPercentage: discountPercentage * 100,
        cgtDiscountAmount,
        netCapitalGain,
      };
      
      // Add to FY group
      if (!cgtEventsByFY.has(tx.financialYear)) {
        cgtEventsByFY.set(tx.financialYear, []);
      }
      cgtEventsByFY.get(tx.financialYear)!.push(cgtEvent);
    }
  }
  
  // Build FY summaries
  const summaryByFY = buildFYSummaries(cgtEventsByFY, transactions.map(t => t.financialYear));
  
  // Build holdings
  const holdings = buildHoldings(inventory);
  
  // Get date range
  const dates = transactions.map(t => t.transactionDate);
  
  return {
    success: true,
    fileType: 'crypto',
    ownerName,
    summaryByFY,
    holdings,
    totalTransactions: transactions.length,
    dateRange: {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime()))),
    },
  };
}

/**
 * Calculate CGT for ASX transactions
 */
function calculateASXCGT(
  transactions: ASXTransaction[],
  ownerName: string
): ProcessingResult {
  // FIFO inventory per stock code
  const inventory: Map<string, InventoryLot[]> = new Map();
  const stockNames: Map<string, string> = new Map();
  
  // CGT events grouped by FY
  const cgtEventsByFY: Map<string, CGTEvent[]> = new Map();
  
  // Process each transaction
  for (const tx of transactions) {
    const code = tx.code;
    stockNames.set(code, tx.company);
    
    if (tx.type === 'Buy') {
      // Cost base = trade value + brokerage
      const totalCost = tx.tradeValue + tx.brokerage;
      const costPerUnit = totalCost / tx.quantity;
      
      const lot: InventoryLot = {
        date: tx.date,
        quantityRemaining: tx.quantity,
        originalQuantity: tx.quantity,
        costPerUnit,
        totalCost,
        financialYear: tx.financialYear,
      };
      
      if (!inventory.has(code)) {
        inventory.set(code, []);
      }
      inventory.get(code)!.push(lot);
      
    } else if (tx.type === 'Sell') {
      // Proceeds = trade value - brokerage
      const proceeds = tx.tradeValue - tx.brokerage;
      let quantityToSell = tx.quantity;
      let costBase = 0;
      const acquisitionDetails: { date: Date; amount: number; cost: number; holdingDays: number }[] = [];
      
      const stockLots = inventory.get(code) || [];
      
      while (quantityToSell > 0.0001 && stockLots.length > 0) {
        const oldestLot = stockLots[0];
        
        if (oldestLot.quantityRemaining <= 0.0001) {
          stockLots.shift();
          continue;
        }
        
        const lotAmountUsed = Math.min(quantityToSell, oldestLot.quantityRemaining);
        const lotCost = lotAmountUsed * oldestLot.costPerUnit;
        const holdingDays = Math.floor(
          (tx.date.getTime() - oldestLot.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        acquisitionDetails.push({
          date: oldestLot.date,
          amount: lotAmountUsed,
          cost: lotCost,
          holdingDays,
        });
        
        costBase += lotCost;
        oldestLot.quantityRemaining -= lotAmountUsed;
        quantityToSell -= lotAmountUsed;
        
        if (oldestLot.quantityRemaining <= 0.0001) {
          stockLots.shift();
        }
      }
      
      // Calculate gain/loss
      const grossGainLoss = proceeds - costBase;
      
      // Calculate discount eligibility
      const totalSold = acquisitionDetails.reduce((sum, d) => sum + d.amount, 0);
      const discountEligibleAmount = acquisitionDetails
        .filter(d => d.holdingDays > 365)
        .reduce((sum, d) => sum + d.amount, 0);
      const discountPercentage = totalSold > 0 ? discountEligibleAmount / totalSold : 0;
      
      const avgHoldingDays = totalSold > 0
        ? acquisitionDetails.reduce((sum, d) => sum + d.holdingDays * d.amount, 0) / totalSold
        : 0;
      const isLongTerm = avgHoldingDays > 365;
      
      // Apply 50% discount only to gains on long-term holdings
      let cgtDiscountAmount = 0;
      let netCapitalGain = grossGainLoss;
      
      if (grossGainLoss > 0 && discountPercentage > 0) {
        const discountEligibleGain = grossGainLoss * discountPercentage;
        cgtDiscountAmount = discountEligibleGain * 0.5;
        netCapitalGain = grossGainLoss - cgtDiscountAmount;
      }
      
      const earliestAcquisition = acquisitionDetails.length > 0
        ? acquisitionDetails.reduce((min, d) => d.date < min ? d.date : min, acquisitionDetails[0].date)
        : tx.date;
      
      const cgtEvent: CGTEvent = {
        disposalDate: tx.date,
        acquisitionDate: earliestAcquisition,
        asset: code,
        assetName: tx.company,
        quantity: tx.quantity,
        proceeds,
        costBase,
        grossGainLoss,
        holdingDays: Math.round(avgHoldingDays),
        isLongTerm,
        discountEligible: discountPercentage > 0,
        discountPercentage: discountPercentage * 100,
        cgtDiscountAmount,
        netCapitalGain,
      };
      
      // Add to FY group
      if (!cgtEventsByFY.has(tx.financialYear)) {
        cgtEventsByFY.set(tx.financialYear, []);
      }
      cgtEventsByFY.get(tx.financialYear)!.push(cgtEvent);
    }
  }
  
  // Build FY summaries
  const summaryByFY = buildFYSummaries(cgtEventsByFY, transactions.map(t => t.financialYear));
  
  // Build holdings with names
  const holdings = buildHoldings(inventory, stockNames);
  
  // Get date range
  const dates = transactions.map(t => t.date);
  
  return {
    success: true,
    fileType: 'asx',
    ownerName,
    summaryByFY,
    holdings,
    totalTransactions: transactions.length,
    dateRange: {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime()))),
    },
  };
}

/**
 * Build financial year summaries
 */
function buildFYSummaries(
  cgtEventsByFY: Map<string, CGTEvent[]>,
  allFYs: string[]
): FYSummary[] {
  // Get unique FYs sorted
  const uniqueFYs = [...new Set(allFYs)].sort();
  
  return uniqueFYs.map(fy => {
    const events = cgtEventsByFY.get(fy) || [];
    const { start: fyStart, end: fyEnd } = getFYDateRange(fy);
    
    const shortTermEvents = events.filter(e => !e.isLongTerm);
    const longTermEvents = events.filter(e => e.isLongTerm);
    
    const shortTermGains = shortTermEvents
      .filter(e => e.grossGainLoss > 0)
      .reduce((sum, e) => sum + e.grossGainLoss, 0);
    const shortTermLosses = shortTermEvents
      .filter(e => e.grossGainLoss < 0)
      .reduce((sum, e) => sum + e.grossGainLoss, 0);
    const longTermGains = longTermEvents
      .filter(e => e.grossGainLoss > 0)
      .reduce((sum, e) => sum + e.grossGainLoss, 0);
    const longTermLosses = longTermEvents
      .filter(e => e.grossGainLoss < 0)
      .reduce((sum, e) => sum + e.grossGainLoss, 0);
    
    return {
      fy,
      fyStart,
      fyEnd,
      events,
      totalProceeds: events.reduce((sum, e) => sum + e.proceeds, 0),
      totalCostBase: events.reduce((sum, e) => sum + e.costBase, 0),
      shortTermGains,
      shortTermLosses,
      longTermGains,
      longTermLosses,
      grossCapitalGain: events.reduce((sum, e) => sum + e.grossGainLoss, 0),
      totalDiscount: events.reduce((sum, e) => sum + e.cgtDiscountAmount, 0),
      netCapitalGain: events.reduce((sum, e) => sum + e.netCapitalGain, 0),
    };
  });
}

/**
 * Build current holdings list
 */
function buildHoldings(
  inventory: Map<string, InventoryLot[]>,
  names?: Map<string, string>
): Holding[] {
  const holdings: Holding[] = [];
  
  for (const [asset, lots] of inventory) {
    const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantityRemaining, 0);
    const totalCost = lots.reduce((sum, lot) => sum + lot.quantityRemaining * lot.costPerUnit, 0);
    
    if (totalQuantity > 0.000001) {
      holdings.push({
        asset,
        assetName: names?.get(asset),
        quantity: totalQuantity,
        costBase: totalCost,
        avgCost: totalCost / totalQuantity,
      });
    }
  }
  
  // Sort by cost base descending
  return holdings.sort((a, b) => b.costBase - a.costBase);
}
