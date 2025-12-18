import React from 'react';
import { FileText, PieChart, BarChart3, Bitcoin, TrendingUp } from 'lucide-react';

// Tab types for mixed portfolio
export type TabType =
  | 'overview'
  | 'crypto-cgt'
  | 'crypto-portfolio'
  | 'asx-cgt'
  | 'asx-portfolio'
  // Single portfolio types (backward compatible)
  | 'cgt-report'
  | 'portfolio-view';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isMixed: boolean; // Whether portfolio has both crypto and ASX
  hasCrypto: boolean;
  hasASX: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  isMixed,
}) => {
  // For mixed portfolios, show 5 tabs
  if (isMixed) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap border-b border-gray-100">
          {/* Overview Tab */}
          <button
            onClick={() => onTabChange('overview')}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm
              ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </button>

          {/* Crypto CGT Tab */}
          <button
            onClick={() => onTabChange('crypto-cgt')}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm
              ${
                activeTab === 'crypto-cgt'
                  ? 'bg-orange-600 text-white border-b-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>Crypto CGT</span>
          </button>

          {/* Crypto Portfolio Tab */}
          <button
            onClick={() => onTabChange('crypto-portfolio')}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm
              ${
                activeTab === 'crypto-portfolio'
                  ? 'bg-orange-600 text-white border-b-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <Bitcoin className="w-4 h-4" />
            <span>Crypto Portfolio</span>
          </button>

          {/* ASX CGT Tab */}
          <button
            onClick={() => onTabChange('asx-cgt')}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm
              ${
                activeTab === 'asx-cgt'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>ASX CGT</span>
          </button>

          {/* ASX Portfolio Tab */}
          <button
            onClick={() => onTabChange('asx-portfolio')}
            className={`
              flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 text-sm
              ${
                activeTab === 'asx-portfolio'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <TrendingUp className="w-4 h-4" />
            <span>ASX Portfolio</span>
          </button>
        </div>
      </div>
    );
  }

  // For single type portfolios, show 3 tabs
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => onTabChange('overview')}
          className={`
            flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
            ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => onTabChange('cgt-report')}
          className={`
            flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
            ${
              activeTab === 'cgt-report'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <FileText className="w-4 h-4" />
          <span>CGT Report</span>
        </button>

        <button
          onClick={() => onTabChange('portfolio-view')}
          className={`
            flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200
            ${
              activeTab === 'portfolio-view'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <PieChart className="w-4 h-4" />
          <span>Portfolio View</span>
        </button>
      </div>
    </div>
  );
};
