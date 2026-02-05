'use client';

import { clsx } from 'clsx';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Finding, Severity } from '@/data/types';
import { StatusBadge } from './StatusBadge';

interface FindingCardProps {
  finding: Finding;
  variant?: 'default' | 'compact' | 'expanded';
}

export function FindingCard({ finding, variant = 'default' }: FindingCardProps) {
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded');

  const icons: Record<Severity, typeof AlertTriangle> = {
    critical: AlertTriangle,
    high: AlertCircle,
    medium: Info,
    low: CheckCircle,
  };

  const colors: Record<Severity, string> = {
    critical: 'border-red-200 bg-red-50',
    high: 'border-orange-200 bg-orange-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50',
  };

  const iconColors: Record<Severity, string> = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
  };

  const Icon = icons[finding.severity];

  if (variant === 'compact') {
    return (
      <div className={clsx(
        'flex items-center gap-3 p-3 rounded-lg border',
        colors[finding.severity]
      )}>
        <Icon className={clsx('w-5 h-5 flex-shrink-0', iconColors[finding.severity])} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{finding.title}</p>
        </div>
        <StatusBadge status={finding.severity} size="sm" />
      </div>
    );
  }

  return (
    <div className={clsx(
      'rounded-lg border overflow-hidden',
      colors[finding.severity]
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/50 transition-colors"
      >
        <Icon className={clsx('w-5 h-5 flex-shrink-0', iconColors[finding.severity])} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={finding.severity} size="sm" />
            <span className="text-xs text-gray-500">{finding.area}</span>
          </div>
          <p className="font-semibold text-gray-900">{finding.title}</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-current/10">
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Evidence</h4>
            <p className="text-sm text-gray-700">{finding.evidence}</p>
            {finding.location && (
              <code className="inline-block mt-1 px-2 py-1 bg-gray-800 text-gray-200 text-xs rounded">
                {finding.location}
              </code>
            )}
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Impact</h4>
            <p className="text-sm text-gray-700">{finding.impact}</p>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recommendation</h4>
            <p className="text-sm text-gray-700">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
