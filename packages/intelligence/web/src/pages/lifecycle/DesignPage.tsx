import { Layers, Lightbulb, Network, BoxSelect, FileCode2 } from "lucide-react";
import { Link } from "react-router-dom";

export function DesignPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Design
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Architecture, modeling, and system design tools
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Available Tools */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Business Domain - Primary Tool */}
              <Link
                to="/design/business-domain/contexts"
                className="block bg-white dark:bg-gray-800 rounded-lg border-2 border-brand-primary-300 dark:border-brand-primary-600 p-6 hover:border-brand-primary-500 dark:hover:border-brand-primary-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-brand-primary-300/20 dark:bg-brand-primary-300/10 group-hover:bg-brand-primary-300/30 transition-colors">
                    <Network className="w-8 h-8 text-brand-primary-600 dark:text-brand-primary-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      Business Domain
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-brand-primary-500 text-white">
                        Active
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Interactive domain modeling with DDD patterns, bounded contexts, aggregates, and event flows
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-brand-primary-600 dark:text-brand-primary-300 font-medium">
                      Open Tool →
                    </div>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* Coming Soon Tools */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>Coming Soon</span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(Planned Features)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Architecture Diagrams */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <BoxSelect className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Architecture Diagrams
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visual architecture diagrams with C4 model support, system context, and component views
                    </p>
                  </div>
                </div>
              </div>

              {/* API Designer */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <FileCode2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      API Designer
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Design and document REST/GraphQL APIs with OpenAPI spec generation
                    </p>
                  </div>
                </div>
              </div>

              {/* Database Schema Designer */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 opacity-60">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Lightbulb className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Database Schema
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visual database schema designer with migration scripts and relationship mapping
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-brand-primary-300/10 dark:bg-brand-primary-300/5 border border-brand-primary-300 dark:border-brand-primary-600 rounded-lg p-6">
            <h3 className="font-semibold text-brand-primary-700 dark:text-brand-primary-300 mb-3">
              Quick Start
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-300">•</span>
                <span>
                  <Link to="/design/business-domain/chat" className="text-brand-primary-600 dark:text-brand-primary-300 hover:underline font-medium">
                    Start with AI Chat
                  </Link>
                  {" "}to create your first domain model
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-300">•</span>
                <span>
                  Explore{" "}
                  <Link to="/design/business-domain/contexts" className="text-brand-primary-600 dark:text-brand-primary-300 hover:underline font-medium">
                    Context Map
                  </Link>
                  {" "}to visualize bounded contexts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-300">•</span>
                <span>
                  Define{" "}
                  <Link to="/design/business-domain/aggregates" className="text-brand-primary-600 dark:text-brand-primary-300 hover:underline font-medium">
                    Aggregates
                  </Link>
                  {" "}and their relationships
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
