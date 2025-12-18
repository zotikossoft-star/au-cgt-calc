import React from 'react';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { ProcessingResult, PDFReport } from '../types';
import { formatCurrency, formatDate } from '../utils/fileDetector';

interface ResultsProps {
  result: ProcessingResult;
  reports: PDFReport[];
  onDownload: (report: PDFReport) => void;
  onDownloadAll: () => void;
  onReset: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  result,
  reports,
  onDownload,
  onDownloadAll,
  onReset,
}) => {
  const totalNetCGT = result.summaryByFY.reduce((sum, fy) => sum + fy.netCapitalGain, 0);
  const totalEvents = result.summaryByFY.reduce((sum, fy) => sum + fy.events.length, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            CGT Report: {result.ownerName}
          </h2>
          <p className="text-gray-500">
            {result.fileType === 'crypto' ? 'Cryptocurrency' : 'ASX Shares'} • 
            {result.totalTransactions} transactions
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Financial Years</p>
              <p className="text-xl font-bold text-gray-800">{result.summaryByFY.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">CGT Events</p>
              <p className="text-xl font-bold text-gray-800">{totalEvents}</p>
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Holdings</p>
              <p className="text-xl font-bold text-gray-800">{result.holdings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FY Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Summary by Financial Year</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial Year
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CGT Events
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Gain/Loss
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  50% Discount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net CGT (Item 18)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.summaryByFY.map((fy, index) => {
                const report = reports.find(r => r.fy === fy.fy);
                return (
                  <tr key={fy.fy} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{fy.fy}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(fy.fyStart)} - {formatDate(fy.fyEnd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                      {fy.events.length}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                      fy.grossCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(fy.grossCapitalGain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                      {fy.totalDiscount > 0 ? `-${formatCurrency(fy.totalDiscount)}` : '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                      fy.netCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(fy.netCapitalGain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {report && (
                        <button
                          onClick={() => onDownload(report)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download All Button */}
      {reports.length > 1 && (
        <div className="flex justify-center">
          <button
            onClick={onDownloadAll}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Download All Reports ({reports.length} PDFs)
          </button>
        </div>
      )}

      {/* Holdings Summary */}
      {result.holdings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Current Holdings (Unrealised)</h3>
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
                    Cost Base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.holdings.slice(0, 10).map((holding, index) => (
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
                    {result.holdings.length} assets
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-gray-800">
                    {formatCurrency(result.holdings.reduce((sum, h) => sum + h.costBase, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {result.holdings.length > 10 && (
            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
              Showing 10 of {result.holdings.length} holdings
            </div>
          )}
        </div>
      )}

      {/* Privacy reminder */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🔒 All processing was done locally in your browser. No data was sent to any server.
        </p>
      </div>
    </div>
  );
};
