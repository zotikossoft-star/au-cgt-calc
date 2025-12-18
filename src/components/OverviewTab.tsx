import React from 'react';
import { ProcessingResult } from '../types';
import { formatCurrency } from '../utils/fileDetector';
import { Calendar, FileText, TrendingUp, TrendingDown, Wallet, Bitcoin, TrendingUp as StockIcon, RefreshCw } from 'lucide-react';

interface OverviewTabProps {
  result: ProcessingResult;
  onReset: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ result, onReset }) => {
  const totalNetCGT = result.summaryByFY.reduce((sum, fy) => sum + fy.netCapitalGain, 0);
  const totalEvents = result.summaryByFY.reduce((sum, fy) => sum + fy.events.length, 0);

  // Separate crypto and ASX holdings
  const cryptoHoldings = result.holdings.filter(h => !h.asset.includes('.AX'));
  const asxHoldings = result.holdings.filter(h => h.asset.includes('.AX'));

  const cryptoTotalCost = cryptoHoldings.reduce((sum, h) => sum + h.costBase, 0);
  const asxTotalCost = asxHoldings.reduce((sum, h) => sum + h.costBase, 0);
  const totalInvested = cryptoTotalCost + asxTotalCost;

  // Separate CGT by type
  const cryptoEvents = result.summaryByFY.flatMap(fy =>
    fy.events.filter(e => !e.asset.includes('.AX'))
  );
  const asxEvents = result.summaryByFY.flatMap(fy =>
    fy.events.filter(e => e.asset.includes('.AX'))
  );

  const cryptoNetCGT = cryptoEvents.reduce((sum, e) => sum + e.netCapitalGain, 0);
  const asxNetCGT = asxEvents.reduce((sum, e) => sum + e.netCapitalGain, 0);

  // Determine if portfolio is mixed or single type
  const isMixed = cryptoHoldings.length > 0 && asxHoldings.length > 0;
  const isCryptoOnly = cryptoHoldings.length > 0 && asxHoldings.length === 0;
  const isASXOnly = asxHoldings.length > 0 && cryptoHoldings.length === 0;

  // Get subtitle based on portfolio type
  const getSubtitle = () => {
    if (isMixed) return 'Combined metrics across Cryptocurrency and ASX Shares';
    if (isCryptoOnly) return 'Cryptocurrency portfolio summary';
    if (isASXOnly) return 'ASX Shares portfolio summary';
    return 'Portfolio summary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Portfolio Overview</h2>
          <p className="text-gray-500">{getSubtitle()}</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          New Report
        </button>
      </div>

      {/* Combined Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(totalInvested)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${totalNetCGT >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {totalNetCGT >= 0
                ? <TrendingUp className="w-5 h-5 text-green-600" />
                : <TrendingDown className="w-5 h-5 text-red-600" />
              }
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Net CGT</p>
              <p className={`text-xl font-bold ${totalNetCGT >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalNetCGT)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Holdings</p>
              <p className="text-xl font-bold text-gray-800">{result.holdings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CGT Events</p>
              <p className="text-xl font-bold text-gray-800">{totalEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Type - Only show for mixed portfolios */}
      {isMixed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crypto Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Bitcoin className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-orange-900">Cryptocurrency</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">Holdings</span>
                <span className="font-semibold text-orange-900">{cryptoHoldings.length} assets</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">Total Invested</span>
                <span className="font-semibold text-orange-900">{formatCurrency(cryptoTotalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-700">CGT Events</span>
                <span className="font-semibold text-orange-900">{cryptoEvents.length}</span>
              </div>
              <div className="flex justify-between items-center border-t border-orange-300 pt-3">
                <span className="text-sm font-medium text-orange-800">Net CGT</span>
                <span className={`font-bold ${cryptoNetCGT >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(cryptoNetCGT)}
                </span>
              </div>
            </div>
          </div>

          {/* ASX Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <StockIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">ASX Shares</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Holdings</span>
                <span className="font-semibold text-blue-900">{asxHoldings.length} stocks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Total Invested</span>
                <span className="font-semibold text-blue-900">{formatCurrency(asxTotalCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">CGT Events</span>
                <span className="font-semibold text-blue-900">{asxEvents.length}</span>
              </div>
              <div className="flex justify-between items-center border-t border-blue-300 pt-3">
                <span className="text-sm font-medium text-blue-800">Net CGT</span>
                <span className={`font-bold ${asxNetCGT >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(asxNetCGT)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <h4 className="font-semibold text-purple-900 mb-2">About This Overview</h4>
        <p className="text-sm text-purple-700">
          {isMixed
            ? 'This overview combines data from both your cryptocurrency and ASX share portfolios. Use the tabs above to view detailed CGT reports and portfolio analytics for each asset type separately.'
            : 'This overview shows your portfolio summary. Use the tabs above to view detailed CGT reports and holdings breakdown.'}
        </p>
      </div>

      {/* Privacy reminder */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🔒 All calculations were done locally in your browser. No data was sent to any server.
        </p>
      </div>
    </div>
  );
};
