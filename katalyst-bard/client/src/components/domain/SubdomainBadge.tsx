import type { SubdomainType } from "../../types/domain";

interface SubdomainBadgeProps {
  subdomainType: SubdomainType | null;
}

const SUBDOMAIN_STYLES: Record<SubdomainType, string> = {
  core: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  supporting:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  generic: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export function SubdomainBadge({ subdomainType }: SubdomainBadgeProps) {
  if (!subdomainType) return null;

  return (
    <span
      className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${SUBDOMAIN_STYLES[subdomainType]}`}
    >
      {subdomainType.charAt(0).toUpperCase() + subdomainType.slice(1)}
    </span>
  );
}
