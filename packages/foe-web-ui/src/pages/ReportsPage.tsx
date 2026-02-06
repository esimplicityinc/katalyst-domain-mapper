import { useState, useEffect } from 'react';
import { ReportUpload } from '../components/ReportUpload';
import { ApiKeyPrompt } from '../components/ApiKeyPrompt';
import { OverviewCard } from '../components/OverviewCard';
import { DimensionCard } from '../components/DimensionCard';
import { TriangleDiagram } from '../components/TriangleDiagram';
import { FindingsTable } from '../components/FindingsTable';
import { GapsTable } from '../components/GapsTable';
import { FileJson, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import type { FOEReport } from '../types/report';

const DIMENSION_COLORS = {
  feedback: '#3b82f6',
  understanding: '#9333ea',
  confidence: '#10b981',
};

type PageState = 'loading' | 'needs-key' | 'ready';

export function ReportsPage() {
  const [report, setReport] = useState<FOEReport | null>(null);
  const [pageState, setPageState] = useState<PageState>('loading');

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    setPageState('loading');
    try {
      const status = await api.getConfigStatus();
      setPageState(status.anthropicApiKey ? 'ready' : 'needs-key');
    } catch {
      setPageState('ready');
    }
  };

  const handleReset = () => {
    setReport(null);
  };

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Connecting...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'needs-key') {
    return (
      <ApiKeyPrompt
        onConfigured={() => setPageState('ready')}
        onSkip={() => setPageState('ready')}
      />
    );
  }

  if (!report) {
    return <ReportUpload onReportLoaded={setReport} />;
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  FOE Report Viewer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Flow Optimized Engineering Assessment
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Load New Report
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <OverviewCard report={report} />
          <TriangleDiagram report={report} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DimensionCard
              name="Feedback"
              dimension={report.dimensions.feedback}
              color={DIMENSION_COLORS.feedback}
            />
            <DimensionCard
              name="Understanding"
              dimension={report.dimensions.understanding}
              color={DIMENSION_COLORS.understanding}
            />
            <DimensionCard
              name="Confidence"
              dimension={report.dimensions.confidence}
              color={DIMENSION_COLORS.confidence}
            />
          </div>

          <FindingsTable topStrengths={report.topStrengths} />
          <GapsTable topGaps={report.topGaps} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Report generated on {new Date(report.generated).toLocaleString()}
            </p>
            <p className="mt-1">
              FOE Scanner v{report.version} •{' '}
              <a
                href="https://foe.engineering"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more about Flow Optimized Engineering
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
