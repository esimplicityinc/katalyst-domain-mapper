import { Search, Lightbulb, Users, FileText } from "lucide-react";

export function DiscoveryPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Discovery
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              User research, problem exploration, and insights gathering
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
                  The Discovery stage will help you understand user needs, explore problem spaces, 
                  and gather insights before building solutions.
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
                <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Personas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Define and manage user personas with goals, pain points, and behaviors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    User Stories
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Create, organize, and link user stories to domain capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Research Repository
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Store and organize user research, interviews, and insights
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
