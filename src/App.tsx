import { useState, useCallback } from 'react';
import { Header, FileUpload, Results } from './components';
import { parseCSV } from './utils/csvParser';
import { calculateCGT } from './utils/cgtCalculator';
import { generatePDFReports, downloadPDF, downloadAllPDFs } from './utils/pdfGenerator';
import { ProcessingResult, PDFReport, CryptoTransaction, ASXTransaction } from './types';

type AppState = 'upload' | 'processing' | 'results';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [reports, setReports] = useState<PDFReport[]>([]);

  const handleFileSelect = useCallback(async (files: File[]) => {
    setError(undefined);
    setState('processing');

    try {
      // Parse all CSV files
      console.log(`Processing ${files.length} files:`, files.map(f => f.name));
      const parseResults = await Promise.all(files.map(file => parseCSV(file)));

      console.log('Parse results:', parseResults.map((r, i) => ({
        file: files[i].name,
        fileType: r.fileType,
        error: r.error,
        transactionCount: r.cryptoTransactions?.length || r.asxTransactions?.length || 0
      })));

      // Check for errors (but ignore "no transactions" errors)
      const errors = parseResults.filter(r =>
        (r.error && !r.error.includes('No transactions found')) || r.fileType === 'unknown'
      );

      if (errors.length > 0) {
        const errorIndex = parseResults.findIndex(r =>
          (r.error && !r.error.includes('No transactions found')) || r.fileType === 'unknown'
        );
        console.error(`Error in file ${files[errorIndex]?.name}:`, errors[0]);
        setError(errors[0].error || 'Unable to detect file format in one or more files');
        setState('upload');
        return;
      }

      // Determine file type (can be mixed)
      const fileTypes = parseResults.map(r => r.fileType);
      const uniqueTypes = [...new Set(fileTypes)];

      // Determine overall file type
      let fileType: 'crypto' | 'asx' | 'mixed' = 'crypto';
      if (uniqueTypes.length > 1) {
        fileType = 'mixed'; // Both crypto and ASX files uploaded
      } else {
        fileType = uniqueTypes[0] as 'crypto' | 'asx';
      }

      // Combine all transactions from all files
      const allCryptoTransactions: CryptoTransaction[] = parseResults
        .flatMap(r => r.cryptoTransactions || [])
        .sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());

      const allAsxTransactions: ASXTransaction[] = parseResults
        .flatMap(r => r.asxTransactions || [])
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      // Check if we have any transactions at all
      const totalTransactions = allCryptoTransactions.length + allAsxTransactions.length;

      if (totalTransactions === 0) {
        setError('No transactions found in any of the uploaded files');
        setState('upload');
        return;
      }

      console.log(`Combined ${totalTransactions} transactions from ${files.length} file(s)`);
      console.log(`- Crypto: ${allCryptoTransactions.length}, ASX: ${allAsxTransactions.length}`);

      // Calculate CGT
      const cgtResult = calculateCGT(
        fileType,
        allCryptoTransactions.length > 0 ? allCryptoTransactions : undefined,
        allAsxTransactions.length > 0 ? allAsxTransactions : undefined,
        'CGT Report'
      );

      if (!cgtResult.success) {
        setError(cgtResult.errors?.join(', ') || 'Failed to calculate CGT');
        setState('upload');
        return;
      }

      // Generate PDFs
      const pdfReports = generatePDFReports(cgtResult);

      setResult(cgtResult);
      setReports(pdfReports);
      setState('results');

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('upload');
    }
  }, []);

  const handleDownload = useCallback((report: PDFReport) => {
    downloadPDF(report);
  }, []);

  const handleDownloadAll = useCallback(() => {
    downloadAllPDFs(reports);
  }, [reports]);

  const handleReset = useCallback(() => {
    setState('upload');
    setResult(null);
    setReports([]);
    setError(undefined);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {state === 'upload' && (
          <FileUpload
            onFileSelect={handleFileSelect}
            isProcessing={false}
            error={error}
          />
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-xl font-medium text-gray-700">Processing your transactions...</p>
            <p className="text-gray-500 mt-2">Calculating CGT using FIFO method</p>
          </div>
        )}

        {state === 'results' && result && (
          <Results
            result={result}
            reports={reports}
            onDownload={handleDownload}
            onDownloadAll={handleDownloadAll}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="mb-2">
            Australian CGT Calculator • For Cryptocurrency & ASX Shares
          </p>
          <p className="text-sm">
            🔒 100% Privacy - All calculations run locally in your browser
          </p>
          <p className="text-xs mt-4">
            Disclaimer: This tool is for informational purposes only. 
            Consult a registered tax agent for professional advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
