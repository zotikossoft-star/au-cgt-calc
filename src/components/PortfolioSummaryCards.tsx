import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Package, Shield } from 'lucide-react';
import { PortfolioMetrics } from '../types';
import { formatCurrency } from '../utils/fileDetector';

interface PortfolioSummaryCardsProps {
  metrics: PortfolioMetrics;
}

export const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Invested */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Wallet className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Invested</p>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(metrics.totalInvested)}
            </p>
          </div>
        </div>
      </div>

      {/* Realized Gains */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${metrics.totalRealizedGain >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
            {metrics.totalRealizedGain >= 0
              ? <TrendingUp className="w-5 h-5 text-green-600" />
              : <TrendingDown className="w-5 h-5 text-red-600" />
            }
          </div>
          <div>
            <p className="text-sm text-gray-500">Realized Gains</p>
            <p className={`text-xl font-bold ${metrics.totalRealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.totalRealizedGain)}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Count */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Holdings</p>
            <p className="text-xl font-bold text-gray-800">{metrics.holdingsCount}</p>
          </div>
        </div>
      </div>

      {/* Tax Efficiency */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tax Efficiency</p>
            <p className="text-xl font-bold text-indigo-600">
              {metrics.longTermGainsPercent.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
