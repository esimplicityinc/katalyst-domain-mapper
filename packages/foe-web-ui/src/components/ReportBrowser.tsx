import { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, Loader2, Server } from 'lucide-react';
import { api, type ReportSummary } from '../api/client';
import type { FOEReport } from '../types/report';

interface ReportBrowserProps {
  onReportLoaded: (report: FOEReport) => void;
}

const MATURITY_COLORS: Record<string, string> = {
  Optimized: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Practicing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Emerging: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  Hypothesized: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function scoreColor(score: number): string {
  if (score >= 76) return 'text-green-600 dark:text-green-400';
  if (score >= 51) return 'text-blue-600 dark:text-blue-400';
  if (score >= 26) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function ReportBrowser({ onReportLoaded }: ReportBrowserProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const healthy = await api.isHealthy();
      setApiAvailable(healthy);
      if (!healthy) {
        setError('API is not reachable. Make sure the FOE API is running on the configured URL.');
        return;
      }
      const data = await api.listReports({ limit: 50 });
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLoadReport = async (id: string) => {
    setLoadingReport(id);
    setError(null);
    try {
      // Try to get the raw report first (scanner format matches web-ui types)
      const raw = await api.getReportRaw(id);
      if (raw && typeof raw === 'object') {
        onReportLoaded(raw as FOEReport);
        return;
      }
      // Fallback: get the canonical report
      const report = await api.getReport(id);
      onReportLoaded(report as FOEReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoadingReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Connecting to FOE API...</p>
      </div>
    );
  }

  if (apiAvailable === false) {
    return (
      <div className="flex flex-col items-center py-12">
        <Server className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          API Not Available
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
          Could not connect to the FOE API. Start the API server and try again.
        </p>
        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded text-gray-600 dark:text-gray-400 mb-4">
          cd packages/foe-api && bun run dev
        </code>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {reports.length} report{reports.length !== 1 ? 's' : ''} available
          </h3>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <Database className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No reports found. Upload a report or trigger a scan via the API.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => handleLoadReport(report.id)}
              disabled={loadingReport !== null}
              className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {report.repositoryName}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        MATURITY_COLORS[report.maturityLevel] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {report.maturityLevel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Scanned {new Date(report.scanDate).toLocaleDateString()} at{' '}
                    {new Date(report.scanDate).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`text-2xl font-bold tabular-nums ${scoreColor(report.overallScore)}`}>
                    {Math.round(report.overallScore)}
                  </span>
                  {loadingReport === report.id && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
