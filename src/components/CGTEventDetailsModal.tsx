import React from 'react';
import { X } from 'lucide-react';
import { CGTEvent } from '../types';
import { formatCurrency, formatDate } from '../utils/fileDetector';

interface CGTEventDetailsModalProps {
  event: CGTEvent;
  onClose: () => void;
}

export const CGTEventDetailsModal: React.FC<CGTEventDetailsModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{event.asset}</h2>
              {event.assetName && <p className="text-blue-100 text-sm mt-1">{event.assetName}</p>}
              <p className="text-blue-100 text-sm mt-1">
                Disposal Date: {formatDate(event.disposalDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-blue-500">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Cost Basis</p>
              <p className="text-white text-lg font-bold mt-1">{formatCurrency(event.costBase)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Proceeds</p>
              <p className="text-white text-lg font-bold mt-1">{formatCurrency(event.proceeds)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Gross Gain</p>
              <p className={`text-lg font-bold mt-1 ${event.grossGainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(event.grossGainLoss)}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wider">Taxable Gain</p>
              <p className={`text-lg font-bold mt-1 ${event.netCapitalGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(event.netCapitalGain)}
              </p>
              <p className="text-blue-100 text-xs mt-1">After 50% CGT discount</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {/* Sale Transaction */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              Sale Transaction
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(event.disposalDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="font-semibold text-gray-900">{event.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proceeds</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(event.proceeds)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Unit</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(event.proceeds / event.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Transactions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              Purchase Transactions (FIFO)
            </h3>
            {event.acquisitionDetails && event.acquisitionDetails.length > 0 ? (
              <div className="space-y-3">
                {event.acquisitionDetails.map((detail, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      detail.holdingDays > 365
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Parcel {index + 1}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            detail.holdingDays > 365
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {detail.holdingDays > 365 ? 'Long Term' : 'Short Term'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Purchase Date</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatDate(detail.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Quantity</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {detail.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cost Base</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(detail.cost)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cost per Unit</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(detail.cost / detail.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Holding Period</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {detail.holdingDays} days
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No purchase transaction details available</p>
            )}
          </div>

          {/* CGT Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              CGT Calculation Summary
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Cost Base:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(event.costBase)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Proceeds:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(event.proceeds)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-sm font-medium text-gray-700">Gross Capital Gain:</span>
                    <span
                      className={`font-bold ${
                        event.grossGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(event.grossGainLoss)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount Eligible:</span>
                    <span className="font-semibold text-gray-900">
                      {event.discountPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CGT Discount (50%):</span>
                    <span className="font-semibold text-green-600">
                      -{formatCurrency(event.cgtDiscountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-sm font-medium text-gray-700">Net Capital Gain:</span>
                    <span
                      className={`font-bold ${
                        event.netCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(event.netCapitalGain)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
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
