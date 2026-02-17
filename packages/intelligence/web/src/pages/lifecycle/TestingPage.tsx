import { TestTube, Lightbulb, FileCheck, Microscope, Shield } from "lucide-react";

export function TestingPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <TestTube className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Testing
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quality assurance, test automation, and validation strategies
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Coming Soon Banner */}
          <div className="bg-brand-primary-300/10 dark:bg-brand-primary-300/5 border border-brand-primary-300 dark:border-brand-primary-600 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Lightbulb className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-brand-primary-700 dark:text-brand-primary-300">
                  Coming Soon
                </h2>
                <p className="text-sm text-brand-primary-600 dark:text-brand-primary-300 mt-1">
                  The Testing stage will help you define test strategies, manage test automation, 
                  and track quality metrics across your delivery pipeline.
                </p>
              </div>
            </div>
          </div>

          {/* Planned Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Planned Features
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Flow Optimized Scanner
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Analyze repository maturity across Understanding, Feedback, and Confidence dimensions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Microscope className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Test Strategy Manager
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Define and manage test strategies, including BDD scenarios and acceptance criteria
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TestTube className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Test Automation Hub
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage test suites, track coverage, and monitor test execution results
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Quality Gates
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure and enforce quality gates for builds, deployments, and releases
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
