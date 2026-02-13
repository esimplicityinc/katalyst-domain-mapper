import type { BoundedContext, SubdomainType } from "../../types/domain";
import { DDDTooltip } from "./DDDTooltip";

interface SubdomainOverviewProps {
  contexts: BoundedContext[];
}

interface SubdomainSection {
  type: SubdomainType | "unclassified";
  label: string;
  investment: string;
  strategy: string;
  headerColor: string;
  dotColor: string;
  termKey?: string;
}

const SECTIONS: SubdomainSection[] = [
  {
    type: "core",
    label: "Core",
    investment: "High Investment",
    strategy: "Build",
    headerColor: "text-blue-700 dark:text-blue-300",
    dotColor: "bg-blue-500",
    termKey: "core-subdomain",
  },
  {
    type: "supporting",
    label: "Supporting",
    investment: "Medium Investment",
    strategy: "Integrate",
    headerColor: "text-green-700 dark:text-green-300",
    dotColor: "bg-green-500",
    termKey: "supporting-subdomain",
  },
  {
    type: "generic",
    label: "Generic",
    investment: "Low Investment",
    strategy: "Buy",
    headerColor: "text-gray-600 dark:text-gray-400",
    dotColor: "bg-gray-400",
    termKey: "generic-subdomain",
  },
  {
    type: "unclassified",
    label: "Unclassified",
    investment: "Needs Classification",
    strategy: "Review",
    headerColor: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-400",
  },
];

export function SubdomainOverview({ contexts }: SubdomainOverviewProps) {
  const grouped: Record<string, BoundedContext[]> = {
    core: [],
    supporting: [],
    generic: [],
    unclassified: [],
  };

  for (const ctx of contexts) {
    const key = ctx.subdomainType ?? "unclassified";
    grouped[key].push(ctx);
  }

  // Only show sections that have contexts
  const activeSections = SECTIONS.filter((s) => grouped[s.type].length > 0);

  if (activeSections.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        Subdomain Classification
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeSections.map((section) => {
          const sectionContexts = grouped[section.type];
          return (
            <div
              key={section.type}
              className="border border-gray-100 dark:border-gray-700 rounded-md p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${section.dotColor}`} />
                <h4 className={`text-sm font-semibold ${section.headerColor}`}>
                  {section.label}
                </h4>
                {section.termKey && (
                  <DDDTooltip termKey={section.termKey} position="bottom" />
                )}
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {sectionContexts.length}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{section.investment}</span>
                <span className="text-gray-300 dark:text-gray-600">
                  &middot;
                </span>
                <span>{section.strategy}</span>
              </div>
              <ul className="space-y-1">
                {sectionContexts.map((ctx) => (
                  <li
                    key={ctx.id}
                    className="text-xs text-gray-700 dark:text-gray-300 truncate"
                    title={ctx.title}
                  >
                    {ctx.title}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
