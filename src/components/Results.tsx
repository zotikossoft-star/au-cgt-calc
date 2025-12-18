import React, { useState, useEffect, useMemo } from 'react';
import { ProcessingResult, PDFReport } from '../types';
import { TabNavigation, TabType } from './TabNavigation';
import { OverviewTab } from './OverviewTab';
import { CGTReportView } from './CGTReportView';
import { PortfolioView } from './PortfolioView';

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
  // Check if portfolio has both crypto and ASX
  const hasCrypto = result.holdings.some(h => !h.asset.includes('.AX'));
  const hasASX = result.holdings.some(h => h.asset.includes('.AX'));
  const isMixed = hasCrypto && hasASX;

  // Debug logging
  console.log('Results component rendered:', {
    fileType: result.fileType,
    hasCrypto,
    hasASX,
    isMixed,
    totalHoldings: result.holdings.length,
  });

  // Set initial tab based on portfolio type (use useMemo to recalculate when isMixed changes)
  const initialTab: TabType = useMemo(() => {
    return 'overview'; // Always start with overview tab
  }, [isMixed]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Update active tab if portfolio type changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  console.log('Rendering TabNavigation with:', { isMixed, hasCrypto, hasASX, activeTab });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMixed={isMixed}
        hasCrypto={hasCrypto}
        hasASX={hasASX}
      />

      {/* Mixed Portfolio - 5 Tabs */}
      {isMixed && (
        <>
          {activeTab === 'overview' && (
            <OverviewTab result={result} onReset={onReset} />
          )}

          {activeTab === 'crypto-cgt' && (
            <CGTReportView
              result={result}
              reports={reports}
              onDownload={onDownload}
              onDownloadAll={onDownloadAll}
              onReset={onReset}
              scope="crypto"
            />
          )}

          {activeTab === 'crypto-portfolio' && (
            <PortfolioView
              result={result}
              onReset={onReset}
              scope="crypto"
            />
          )}

          {activeTab === 'asx-cgt' && (
            <CGTReportView
              result={result}
              reports={reports}
              onDownload={onDownload}
              onDownloadAll={onDownloadAll}
              onReset={onReset}
              scope="asx"
            />
          )}

          {activeTab === 'asx-portfolio' && (
            <PortfolioView
              result={result}
              onReset={onReset}
              scope="asx"
            />
          )}
        </>
      )}

      {/* Single Type Portfolio - 3 Tabs */}
      {!isMixed && (
        <>
          {activeTab === 'overview' && (
            <OverviewTab result={result} onReset={onReset} />
          )}

          {activeTab === 'cgt-report' && (
            <CGTReportView
              result={result}
              reports={reports}
              onDownload={onDownload}
              onDownloadAll={onDownloadAll}
              onReset={onReset}
            />
          )}

          {activeTab === 'portfolio-view' && (
            <PortfolioView
              result={result}
              onReset={onReset}
            />
          )}
        </>
      )}
    </div>
  );
};
