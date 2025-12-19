import React, { useState } from 'react';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  RefreshCw,
  List
} from 'lucide-react';
import { ProcessingResult, PDFReport, PortfolioScope, CGTEvent } from '../types';
import { formatCurrency, formatDate } from '../utils/fileDetector';
import { CGTEventDetailsModal } from './CGTEventDetailsModal';
import { AssetEventsModal } from './AssetEventsModal';

interface CGTReportViewProps {
  result: ProcessingResult;
  reports: PDFReport[];
  onDownload: (report: PDFReport) => void;
  onDownloadAll: () => void;
  onReset: () => void;
  scope?: PortfolioScope; // Optional: filter by crypto or asx
}

export const CGTReportView: React.FC<CGTReportViewProps> = ({
  result,
  reports,
  onDownload,
  onDownloadAll,
  onReset,
  scope,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CGTEvent | null>(null);
  const [selectedAssetEvents, setSelectedAssetEvents] = useState<{
    asset: string;
    assetName?: string;
    events: CGTEvent[];
  } | null>(null);
  const [selectedFY, setSelectedFY] = useState<string | null>(null);

  // Filter data by scope if provided
  const filterByScope = (asset: string) => {
    if (!scope || scope === 'combined') return true;
    const isCrypto = !asset.includes('.AX');
    return scope === 'crypto' ? isCrypto : !isCrypto;
  };

  // Filter FY summaries and recalculate totals based on scope
  const filteredSummaries = result.summaryByFY.map(fy => {
    const filteredEvents = fy.events.filter(e => filterByScope(e.asset));
    if (filteredEvents.length === 0 && scope) return null;

    return {
      ...fy,
      events: filteredEvents,
      totalProceeds: filteredEvents.reduce((sum, e) => sum + e.proceeds, 0),
      totalCostBase: filteredEvents.reduce((sum, e) => sum + e.costBase, 0),
      grossCapitalGain: filteredEvents.reduce((sum, e) => sum + e.grossGainLoss, 0),
      netCapitalGain: filteredEvents.reduce((sum, e) => sum + e.netCapitalGain, 0),
      totalDiscount: filteredEvents.reduce((sum, e) => sum + e.cgtDiscountAmount, 0),
    };
  }).filter(Boolean) as typeof result.summaryByFY;

  const filteredHoldings = result.holdings.filter(h => filterByScope(h.asset));

  const totalNetCGT = filteredSummaries.reduce((sum, fy) => sum + fy.netCapitalGain, 0);
  const totalEvents = filteredSummaries.reduce((sum, fy) => sum + fy.events.length, 0);

  // Get label for current scope
  const getScopeLabel = () => {
    if (!scope || scope === 'combined') {
      return result.fileType === 'crypto' ? 'Cryptocurrency' :
             result.fileType === 'asx' ? 'ASX Shares' :
             'Mixed Portfolio (Crypto & ASX)';
    }
    return scope === 'crypto' ? 'Cryptocurrency' : 'ASX Shares';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            CGT Report{scope && ` - ${getScopeLabel()}`}
          </h2>
          <p className="text-gray-500">
            {!scope && getScopeLabel()}
            {!scope && ' • '}
            {totalEvents} CGT events
            {' • '}
            {filteredHoldings.length} holdings
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Summary by Financial Year</h3>
            {selectedFY && (
              <button
                onClick={() => setSelectedFY(null)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
          {selectedFY && (
            <p className="text-xs text-gray-500 mt-1">
              Filtering Realized P/L by {selectedFY} • Click row again or "Clear Filter" to show all years
            </p>
          )}
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
              {filteredSummaries.map((fy, index) => {
                const report = reports.find(r => r.fy === fy.fy);
                const isSelected = selectedFY === fy.fy;
                return (
                  <tr
                    key={fy.fy}
                    onClick={() => setSelectedFY(isSelected ? null : fy.fy)}
                    className={`
                      cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                      }
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {fy.fy}
                        {isSelected && <span className="ml-2 text-blue-600 text-xs">● Selected</span>}
                      </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(report);
                          }}
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

      {/* Realized P/L by Asset */}
      {(() => {
        // Filter summaries by selected FY if applicable
        const summariesToShow = selectedFY
          ? filteredSummaries.filter(fy => fy.fy === selectedFY)
          : filteredSummaries;

        // Group CGT events by asset and calculate totals
        const assetPnL = new Map<string, {
          asset: string;
          assetName?: string;
          totalProceeds: number;
          totalCostBase: number;
          totalPnL: number;
          eventCount: number;
          discountReceived: number;
          longTermEvents: number;
          shortTermEvents: number;
        }>();

        summariesToShow.forEach(fy => {
          fy.events.forEach(event => {
            const existing = assetPnL.get(event.asset) || {
              asset: event.asset,
              assetName: event.assetName,
              totalProceeds: 0,
              totalCostBase: 0,
              totalPnL: 0,
              eventCount: 0,
              discountReceived: 0,
              longTermEvents: 0,
              shortTermEvents: 0,
            };

            existing.totalProceeds += event.proceeds;
            existing.totalCostBase += event.costBase;
            existing.totalPnL += event.grossGainLoss;
            existing.eventCount += 1;
            existing.discountReceived += event.cgtDiscountAmount;

            if (event.isLongTerm) {
              existing.longTermEvents += 1;
            } else {
              existing.shortTermEvents += 1;
            }

            assetPnL.set(event.asset, existing);
          });
        });

        const assetPnLArray = Array.from(assetPnL.values()).sort((a, b) => b.totalPnL - a.totalPnL);

        if (assetPnLArray.length === 0) return null;

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                Realized P/L by Asset
                {selectedFY && <span className="text-blue-600 ml-2">• {selectedFY}</span>}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {selectedFY
                  ? `Assets that participated in CGT events during ${selectedFY}`
                  : 'Assets that participated in CGT events (sold positions)'
                }
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Proceeds
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost Base
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total P/L
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CGT Events
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      50% Discount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assetPnLArray.map((item, index) => {
                    // Get all events for this asset (filtered by selected FY if applicable)
                    const assetEvents: CGTEvent[] = [];
                    summariesToShow.forEach(fy => {
                      fy.events.forEach(event => {
                        if (event.asset === item.asset) {
                          assetEvents.push(event);
                        }
                      });
                    });

                    return (
                      <tr key={item.asset} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.asset}</div>
                          {item.assetName && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.assetName}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                          {formatCurrency(item.totalProceeds)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                          {formatCurrency(item.totalCostBase)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                          item.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(item.totalPnL)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900">{item.eventCount} total</div>
                          {item.longTermEvents > 0 && (
                            <div className="text-xs text-green-600 mt-0.5">
                              ✓ {item.longTermEvents} Long Term
                            </div>
                          )}
                          {item.shortTermEvents > 0 && (
                            <div className="text-xs text-orange-600 mt-0.5">
                              {item.shortTermEvents} Short Term
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {item.discountReceived > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(item.discountReceived)}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">Applied</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">N/A</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {assetEvents.length > 0 && (
                            <button
                              onClick={() => setSelectedAssetEvents({
                                asset: item.asset,
                                assetName: item.assetName,
                                events: assetEvents
                              })}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap"
                            >
                              <List size={14} className="mr-1 flex-shrink-0" />
                              View Breakdown
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-6 py-3 font-bold text-gray-800">TOTAL</td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800">
                      {formatCurrency(assetPnLArray.reduce((sum, item) => sum + item.totalProceeds, 0))}
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-gray-800">
                      {formatCurrency(assetPnLArray.reduce((sum, item) => sum + item.totalCostBase, 0))}
                    </td>
                    <td className={`px-6 py-3 text-right font-bold ${
                      assetPnLArray.reduce((sum, item) => sum + item.totalPnL, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(assetPnLArray.reduce((sum, item) => sum + item.totalPnL, 0))}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-700">
                      {assetPnLArray.reduce((sum, item) => sum + item.eventCount, 0)} events
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-green-600">
                      {formatCurrency(assetPnLArray.reduce((sum, item) => sum + item.discountReceived, 0))}
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Privacy reminder */}
      <div className="text-center">
        <p className="text-xs text-gray-400">
          🔒 All processing was done locally in your browser. No data was sent to any server.
        </p>
      </div>

      {/* Modals */}
      {selectedEvent && (
        <CGTEventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {selectedAssetEvents && (
        <AssetEventsModal
          asset={selectedAssetEvents.asset}
          assetName={selectedAssetEvents.assetName}
          events={selectedAssetEvents.events}
          onClose={() => setSelectedAssetEvents(null)}
        />
      )}
    </div>
  );
};
