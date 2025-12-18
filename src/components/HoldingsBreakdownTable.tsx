import React, { useState } from 'react';
import { Holding } from '../types';
import { formatCurrency } from '../utils/fileDetector';

interface HoldingsBreakdownTableProps {
  holdings: Holding[];
}

type SortField = 'asset' | 'quantity' | 'costBase' | 'avgCost' | 'percentage';
type SortDirection = 'asc' | 'desc';

export const HoldingsBreakdownTable: React.FC<HoldingsBreakdownTableProps> = ({ holdings }) => {
  const [sortField, setSortField] = useState<SortField>('costBase');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Calculate total and percentages
  const totalCostBase = holdings.reduce((sum, h) => sum + h.costBase, 0);
  const holdingsWithPercentage = holdings.map(h => ({
    ...h,
    percentage: totalCostBase > 0 ? (h.costBase / totalCostBase) * 100 : 0,
  }));

  const sortedHoldings = [...holdingsWithPercentage].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortField) {
      case 'asset':
        aVal = a.asset;
        bVal = b.asset;
        break;
      case 'quantity':
        aVal = a.quantity;
        bVal = b.quantity;
        break;
      case 'costBase':
        aVal = a.costBase;
        bVal = b.costBase;
        break;
      case 'avgCost':
        aVal = a.avgCost;
        bVal = b.avgCost;
        break;
      case 'percentage':
        aVal = a.percentage;
        bVal = b.percentage;
        break;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Holdings & Asset Allocation</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('asset')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Asset {sortField === 'asset' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('costBase')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Cost Base {sortField === 'costBase' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('avgCost')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Avg Cost {sortField === 'avgCost' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('percentage')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                % of Portfolio {sortField === 'percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal min-w-[180px]">
                CGT Discount Eligibility
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedHoldings.map((holding, index) => (
              <tr key={holding.asset} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{holding.asset}</div>
                  {holding.assetName && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {holding.assetName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  {holding.quantity.toFixed(holding.quantity < 1 ? 6 : 2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  {formatCurrency(holding.costBase)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  {formatCurrency(holding.avgCost)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(holding.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                      {holding.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {holding.cgtEligibility && (
                    <div>
                      {holding.cgtEligibility.eligiblePercentage === 100 ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                          ✓ All Eligible (100%)
                        </div>
                      ) : holding.cgtEligibility.eligiblePercentage === 0 ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                          None Eligible (0%)
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {holding.cgtEligibility.eligiblePercentage.toFixed(1)}% Eligible
                          </div>
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="text-green-700">
                              ✓ {holding.cgtEligibility.eligibleQuantity.toFixed(holding.cgtEligibility.eligibleQuantity < 1 ? 6 : 2)} eligible
                            </div>
                            <div className="text-orange-700">
                              {holding.cgtEligibility.ineligibleQuantity.toFixed(holding.cgtEligibility.ineligibleQuantity < 1 ? 6 : 2)} not eligible
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-6 py-3 font-bold text-gray-800">TOTAL</td>
              <td className="px-6 py-3 text-right text-gray-700">
                {holdings.length} {holdings.length === 1 ? 'asset' : 'assets'}
              </td>
              <td className="px-6 py-3 text-right font-bold text-gray-800">
                {formatCurrency(totalCostBase)}
              </td>
              <td></td>
              <td className="px-6 py-3 text-right font-medium text-gray-700">
                100.0%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
