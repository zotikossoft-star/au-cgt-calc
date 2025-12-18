import { useState, useCallback } from 'react';
import { Header, FileUpload, Results, OwnerInput } from './components';
import { parseCSV } from './utils/csvParser';
import { calculateCGT } from './utils/cgtCalculator';
import { generatePDFReports, downloadPDF, downloadAllPDFs } from './utils/pdfGenerator';
import { ProcessingResult, PDFReport } from './types';

type AppState = 'upload' | 'processing' | 'results';

function App() {
  const [state, setState] = useState<AppState>('upload');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [reports, setReports] = useState<PDFReport[]>([]);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(undefined);
    setState('processing');

    try {
      // Parse CSV
      const parseResult = await parseCSV(file);

      if (parseResult.error || parseResult.fileType === 'unknown') {
        setError(parseResult.error || 'Unable to detect file format');
        setState('upload');
        return;
      }

      // Calculate CGT
      const name = ownerName.trim() || 'Report';
      const cgtResult = calculateCGT(
        parseResult.fileType,
        parseResult.cryptoTransactions,
        parseResult.asxTransactions,
        name
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
  }, [ownerName]);

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
          <div className="space-y-6">
            <OwnerInput value={ownerName} onChange={setOwnerName} />
            <FileUpload
              onFileSelect={handleFileSelect}
              isProcessing={false}
              error={error}
            />
          </div>
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
