import React from 'react';
import { PortfolioScope } from '../types';

interface PortfolioScopeToggleProps {
  scope: PortfolioScope;
  onChange: (scope: PortfolioScope) => void;
}

export const PortfolioScopeToggle: React.FC<PortfolioScopeToggleProps> = ({ scope, onChange }) => {
  const options: { value: PortfolioScope; label: string }[] = [
    { value: 'combined', label: 'All Assets' },
    { value: 'crypto', label: 'Crypto Only' },
    { value: 'asx', label: 'ASX Only' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${
                  scope === option.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
