import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { ProcessingResult, PortfolioViewData, PortfolioScope } from '../types';
import { calculatePortfolioData } from '../utils/portfolioCalculator';
import { PortfolioSummaryCards } from './PortfolioSummaryCards';
import { HoldingsBreakdownTable } from './HoldingsBreakdownTable';

interface PortfolioViewProps {
  result: ProcessingResult;
  onReset: () => void;
  scope?: PortfolioScope; // Optional: filter by crypto or asx (passed from parent)
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ result, onReset, scope }) => {
  const [data, setData] = useState<PortfolioViewData | null>(null);

  // Calculate portfolio data when scope changes (synchronous)
  useEffect(() => {
    const portfolioData = calculatePortfolioData(result, scope || 'combined');
    setData(portfolioData);
  }, [result, scope]);

  if (!data) {
    return null;
  }

  // Get scope label
  const getScopeLabel = () => {
    if (!scope || scope === 'combined') return 'Portfolio View';
    if (scope === 'crypto') return 'Cryptocurrency Portfolio';
    return 'ASX Shares Portfolio';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {getScopeLabel()}
          </h2>
          <p className="text-gray-500">
            Cost basis analysis • {data.holdings.length} holdings
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Portfolio Summary Cards */}
      <PortfolioSummaryCards metrics={data.metrics} />

      {/* Holdings & Asset Allocation Table */}
      <HoldingsBreakdownTable holdings={data.holdings} />

      {/* Privacy reminder */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🔒 All calculations were done locally in your browser. No data was sent to any server.
        </p>
      </div>
    </div>
  );
};
