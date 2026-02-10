import { ExternalLink } from "lucide-react";

interface MethodLinkProps {
  methodId?: string;
  className?: string;
}

export function MethodLink({ methodId, className = "" }: MethodLinkProps) {
  if (!methodId) return null;

  // TODO: Link to actual Field Guide docs when available
  const fieldGuideUrl = `https://foe.engineering/methods/${methodId}`;

  return (
    <a
      href={fieldGuideUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors ${className}`}
      title={`View Field Guide method ${methodId}`}
    >
      {methodId}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
