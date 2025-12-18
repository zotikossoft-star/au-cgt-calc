import React from 'react';
import { Shield, TrendingUp, Calendar, Award } from 'lucide-react';
import { PortfolioMetrics } from '../types';
import { formatCurrency } from '../utils/fileDetector';

interface TaxEfficiencyDashboardProps {
  metrics: PortfolioMetrics;
}

export const TaxEfficiencyDashboard: React.FC<TaxEfficiencyDashboardProps> = ({ metrics }) => {
  const totalEvents = metrics.longTermEventsCount + metrics.shortTermEventsCount;

  // Determine recommendation
  let recommendation = '';
  let recommendationColor = '';

  if (totalEvents === 0) {
    recommendation = 'No sell transactions yet. Hold assets for 12+ months to maximize tax efficiency.';
    recommendationColor = 'text-gray-600';
  } else if (metrics.longTermGainsPercent >= 80) {
    recommendation = 'Excellent! You\'re maximizing tax efficiency by holding long-term.';
    recommendationColor = 'text-green-600';
  } else if (metrics.longTermGainsPercent >= 50) {
    recommendation = 'Good job! Consider holding more assets longer than 12 months for the 50% CGT discount.';
    recommendationColor = 'text-blue-600';
  } else {
    recommendation = 'Consider holding assets longer than 12 months to qualify for the 50% CGT discount.';
    recommendationColor = 'text-orange-600';
  }

  // Convert average holding period to months/years
  const avgDays = metrics.avgHoldingPeriodDays;
  let holdingDisplay = `${avgDays} days`;

  if (avgDays >= 365) {
    const years = (avgDays / 365).toFixed(1);
    holdingDisplay = `${years} ${parseFloat(years) === 1 ? 'year' : 'years'}`;
  } else if (avgDays >= 30) {
    const months = Math.round(avgDays / 30);
    holdingDisplay = `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Tax Efficiency Dashboard</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Long-term vs Short-term Events */}
        {totalEvents > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Long-term vs Short-term Sales</span>
              <span className="text-sm font-bold text-gray-900">
                {metrics.longTermGainsPercent.toFixed(0)}% long-term
              </span>
            </div>
            <div className="flex h-6 rounded-lg overflow-hidden bg-gray-200">
              <div
                className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${metrics.longTermGainsPercent}%` }}
              >
                {metrics.longTermGainsPercent > 15 && (
                  <span>{metrics.longTermEventsCount} long-term</span>
                )}
              </div>
              <div
                className="bg-orange-500 flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${100 - metrics.longTermGainsPercent}%` }}
              >
                {metrics.longTermGainsPercent < 85 && (
                  <span>{metrics.shortTermEventsCount} short-term</span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.longTermEventsCount} of {totalEvents} sales qualified for 50% CGT discount
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Average Holding Period */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-900">Avg Holding Period</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{holdingDisplay}</p>
            <p className="text-xs text-blue-600 mt-1">
              {avgDays >= 365 ? 'Qualifies for 50% discount' : 'Hold 12+ months for discount'}
            </p>
          </div>

          {/* Total CGT Discount */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-green-900">Total CGT Discount</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(metrics.totalCGTDiscount)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Tax saved from long-term holdings
            </p>
          </div>

          {/* Transactions */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <p className="text-xs font-medium text-indigo-900">Total Transactions</p>
            </div>
            <p className="text-2xl font-bold text-indigo-700">{metrics.totalTransactionCount}</p>
            <p className="text-xs text-indigo-600 mt-1">
              {metrics.totalSellTransactions} sells, {metrics.totalBuyTransactions} buys
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-1">Recommendation</p>
          <p className={`text-sm ${recommendationColor}`}>{recommendation}</p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-1">About the 50% CGT Discount</p>
          <p className="text-xs text-blue-700">
            Australian tax residents can reduce their capital gains by 50% if they hold an asset for more than 12 months before selling. This discount is automatically applied in your CGT calculations.
          </p>
        </div>
      </div>
    </div>
  );
};
