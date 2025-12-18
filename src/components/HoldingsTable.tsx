import React, { useState } from 'react';
import { Holding } from '../types';
import { formatCurrency } from '../utils/fileDetector';

interface HoldingsTableProps {
  holdings: Holding[];
}

type SortField = 'asset' | 'quantity' | 'costBase' | 'avgCost';
type SortDirection = 'asc' | 'desc';

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
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

  const sortedHoldings = [...holdings].sort((a, b) => {
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
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalCostBase = holdings.reduce((sum, h) => sum + h.costBase, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Holdings Detail</h3>
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
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-6 py-3 font-bold text-gray-800">TOTAL</td>
              <td className="px-6 py-3 text-right text-gray-700">
                {holdings.length} assets
              </td>
              <td className="px-6 py-3 text-right font-bold text-gray-800">
                {formatCurrency(totalCostBase)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
