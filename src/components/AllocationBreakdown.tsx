import React from 'react';
import { AssetBreakdown } from '../types';
import { formatCurrency } from '../utils/fileDetector';

interface AllocationBreakdownProps {
  breakdown: AssetBreakdown[];
}

export const AllocationBreakdown: React.FC<AllocationBreakdownProps> = ({ breakdown }) => {
  if (breakdown.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Asset Allocation (by Cost Basis)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost Basis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % of Portfolio
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakdown.map((asset, index) => (
              <tr key={asset.asset} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{asset.asset}</div>
                  {asset.assetName && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {asset.assetName}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  {asset.quantity.toFixed(asset.quantity < 1 ? 6 : 2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                  {formatCurrency(asset.costBase)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(asset.percentOfPortfolio, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                      {asset.percentOfPortfolio.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
