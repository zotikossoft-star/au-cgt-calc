import React from 'react';
import { X } from 'lucide-react';
import { CGTEvent } from '../types';
import { formatCurrency, formatDate } from '../utils/fileDetector';

interface AssetEventsModalProps {
  asset: string;
  assetName?: string;
  events: CGTEvent[];
  onClose: () => void;
}

export const AssetEventsModal: React.FC<AssetEventsModalProps> = ({
  asset,
  assetName,
  events,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{asset}</h2>
            {assetName && <p className="text-blue-100 text-sm mt-1">{assetName}</p>}
            <p className="text-blue-100 text-sm mt-1">{events.length} CGT Events</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {events.map((event, eventIndex) => (
              <div key={eventIndex} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                {/* Sale Transaction Header */}
                <div className="mb-4 pb-4 border-b border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sale #{eventIndex + 1} - {formatDate(event.disposalDate)}
                    </h3>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        event.grossGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.grossGainLoss >= 0 ? '+' : ''}{formatCurrency(event.grossGainLoss)}
                      </div>
                      <div className="text-xs text-gray-500">Gross Gain/Loss</div>
                    </div>
                  </div>

                  {/* Sale Details */}
                  <div className="bg-white rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Quantity Sold</p>
                      <p className="font-semibold text-gray-900">{event.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Proceeds</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(event.proceeds)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Cost Base</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(event.costBase)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">CGT Discount (50%)</p>
                      <p className="font-semibold text-green-600">
                        -{formatCurrency(event.cgtDiscountAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Net Capital Gain */}
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Net Capital Gain:</span>
                      <span className={`text-lg font-bold ${
                        event.netCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(event.netCapitalGain)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Transactions */}
                {event.acquisitionDetails && event.acquisitionDetails.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Purchase Parcels Used (FIFO Method):
                    </h4>
                    <div className="space-y-3">
                      {event.acquisitionDetails.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className={`rounded-lg p-4 ${
                            detail.holdingDays > 365
                              ? 'bg-green-50 border-2 border-green-200'
                              : 'bg-orange-50 border-2 border-orange-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                Parcel {detailIndex + 1}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                detail.holdingDays > 365
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {detail.holdingDays > 365 ? 'Long Term' : 'Short Term'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Purchase Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(detail.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Quantity</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {detail.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Cost Base</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(detail.cost)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Cost per Unit</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(detail.cost / detail.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Holding Period</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {detail.holdingDays} days
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: {events.length} CGT event{events.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
