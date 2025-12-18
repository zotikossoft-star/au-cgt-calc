import {
  ProcessingResult,
  PortfolioViewData,
  PortfolioMetrics,
  AssetBreakdown,
  AssetPerformance,
  PortfolioScope,
  Holding,
  CGTEvent,
} from '../types';

/**
 * Calculate comprehensive portfolio data from existing CGT calculation results
 * All calculations are synchronous and based on cost basis (no market prices)
 */
export function calculatePortfolioData(
  result: ProcessingResult,
  scope: PortfolioScope = 'combined'
): PortfolioViewData {
  // Filter holdings by scope
  const filteredHoldings = filterHoldingsByScope(result.holdings, scope);

  // Calculate portfolio-level metrics
  const metrics = calculatePortfolioMetrics(result, filteredHoldings, scope);

  // Generate asset breakdown
  const assetBreakdown = calculateAssetBreakdown(filteredHoldings);

  // Calculate per-asset performance
  const performanceByAsset = calculateAssetPerformance(result, scope);

  return {
    holdings: filteredHoldings,
    metrics,
    assetBreakdown,
    performanceByAsset,
    lastUpdated: new Date(),
  };
}

/**
 * Filter holdings by portfolio scope (crypto/asx/combined)
 */
function filterHoldingsByScope(holdings: Holding[], scope: PortfolioScope): Holding[] {
  if (scope === 'combined') {
    return holdings;
  }

  return holdings.filter((holding) => {
    const isCrypto = !holding.asset.includes('.AX');
    return scope === 'crypto' ? isCrypto : !isCrypto;
  });
}

/**
 * Calculate portfolio-level metrics
 */
function calculatePortfolioMetrics(
  result: ProcessingResult,
  holdings: Holding[],
  scope: PortfolioScope
): PortfolioMetrics {
  // Total invested (sum of all cost bases)
  const totalInvested = holdings.reduce((sum, h) => sum + h.costBase, 0);

  // Filter CGT events by scope
  const allEvents = result.summaryByFY.flatMap((fy) => fy.events);
  const scopedEvents = filterEventsByScope(allEvents, scope);

  // Total realized gain (sum of net capital gains across all FYs)
  const totalRealizedGain = result.summaryByFY.reduce((sum, fy) => {
    // Filter FY events by scope
    const fyEvents = filterEventsByScope(fy.events, scope);
    if (fyEvents.length === 0) return sum;

    // Calculate net gain for this FY in scope
    const fyNetGain = fyEvents.reduce((total, event) => total + event.netCapitalGain, 0);
    return sum + fyNetGain;
  }, 0);

  // Holdings count
  const holdingsCount = holdings.length;

  // Historical transaction counts
  const totalTransactionCount = result.totalTransactions;

  // Count buy/sell transactions from CGT events
  const totalSellTransactions = scopedEvents.length;

  // Estimate buy transactions (this is approximate as we don't have direct access)
  // For now, we can use holdings count + sell transactions as a rough estimate
  const totalBuyTransactions = holdingsCount + totalSellTransactions;

  // Tax efficiency metrics
  const longTermEvents = scopedEvents.filter((e) => e.isLongTerm);
  const shortTermEvents = scopedEvents.filter((e) => !e.isLongTerm);

  const longTermEventsCount = longTermEvents.length;
  const shortTermEventsCount = shortTermEvents.length;

  const totalEvents = longTermEventsCount + shortTermEventsCount;
  const longTermGainsPercent = totalEvents > 0
    ? (longTermEventsCount / totalEvents) * 100
    : 0;

  // Total CGT discount received
  const totalCGTDiscount = scopedEvents.reduce(
    (sum, event) => sum + event.cgtDiscountAmount,
    0
  );

  // Average holding period (weighted by proceeds)
  let totalWeightedDays = 0;
  let totalProceeds = 0;

  scopedEvents.forEach((event) => {
    totalWeightedDays += event.holdingDays * event.proceeds;
    totalProceeds += event.proceeds;
  });

  const avgHoldingPeriodDays = totalProceeds > 0
    ? Math.round(totalWeightedDays / totalProceeds)
    : 0;

  return {
    totalInvested,
    totalRealizedGain,
    holdingsCount,
    totalTransactionCount,
    totalBuyTransactions,
    totalSellTransactions,
    avgHoldingPeriodDays,
    longTermEventsCount,
    shortTermEventsCount,
    longTermGainsPercent,
    totalCGTDiscount,
  };
}

/**
 * Filter CGT events by scope
 */
function filterEventsByScope(events: CGTEvent[], scope: PortfolioScope): CGTEvent[] {
  if (scope === 'combined') {
    return events;
  }

  return events.filter((event) => {
    const isCrypto = !event.asset.includes('.AX');
    return scope === 'crypto' ? isCrypto : !isCrypto;
  });
}

/**
 * Calculate asset breakdown with cost basis percentages
 */
function calculateAssetBreakdown(holdings: Holding[]): AssetBreakdown[] {
  const totalInvested = holdings.reduce((sum, h) => sum + h.costBase, 0);

  const breakdown: AssetBreakdown[] = holdings.map((holding) => ({
    asset: holding.asset,
    assetName: holding.assetName,
    quantity: holding.quantity,
    costBase: holding.costBase,
    percentOfPortfolio: totalInvested > 0 ? (holding.costBase / totalInvested) * 100 : 0,
  }));

  // Sort by cost base descending
  return breakdown.sort((a, b) => b.costBase - a.costBase);
}

/**
 * Calculate per-asset performance metrics
 */
function calculateAssetPerformance(
  result: ProcessingResult,
  scope: PortfolioScope
): AssetPerformance[] {
  // Get all CGT events
  const allEvents = result.summaryByFY.flatMap((fy) => fy.events);
  const scopedEvents = filterEventsByScope(allEvents, scope);

  // Group events by asset
  const eventsByAsset = new Map<string, CGTEvent[]>();

  scopedEvents.forEach((event) => {
    const existing = eventsByAsset.get(event.asset) || [];
    existing.push(event);
    eventsByAsset.set(event.asset, existing);
  });

  // Calculate performance for each asset
  const performance: AssetPerformance[] = [];

  eventsByAsset.forEach((events, asset) => {
    const totalSold = events.reduce((sum, e) => sum + e.quantity, 0);
    const realizedGain = events.reduce((sum, e) => sum + e.netCapitalGain, 0);
    const cgtDiscount = events.reduce((sum, e) => sum + e.cgtDiscountAmount, 0);
    const transactionCount = events.length;

    // Weighted average holding days
    let totalWeightedDays = 0;
    let totalProceeds = 0;

    events.forEach((event) => {
      totalWeightedDays += event.holdingDays * event.proceeds;
      totalProceeds += event.proceeds;
    });

    const avgHoldingDays = totalProceeds > 0
      ? Math.round(totalWeightedDays / totalProceeds)
      : 0;

    // Calculate total bought (approximate from cost base)
    const totalBought = events.reduce((sum, e) => sum + e.quantity, 0);

    performance.push({
      asset,
      assetName: events[0].assetName,
      totalBought,
      totalSold,
      realizedGain,
      cgtDiscount,
      transactionCount,
      avgHoldingDays,
    });
  });

  // Sort by realized gain descending
  return performance.sort((a, b) => b.realizedGain - a.realizedGain);
}
