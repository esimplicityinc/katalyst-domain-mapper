import { Zap, Lightbulb, GitBranch, Workflow, Bot } from "lucide-react";

export function AutomationPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Automation
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              CI/CD pipelines, automated workflows, and AI agents
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
                  The Automation stage will help you configure CI/CD pipelines, 
                  automated workflows, and AI-powered development agents.
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
                <GitBranch className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    CI/CD Pipelines
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Monitor and manage continuous integration and deployment pipelines
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Workflow className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Automated Workflows
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure automated workflows for testing, deployment, and operations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    AI Development Agents
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure and monitor AI agents for code generation, testing, and review
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
