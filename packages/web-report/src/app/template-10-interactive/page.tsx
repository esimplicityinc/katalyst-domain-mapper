'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Filter,
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  SortAsc,
  SortDesc,
  ArrowLeft,
  BarChart3,
  FileText,
  Lightbulb,
  BookOpen,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import report from '@/data/report.json';
import type { FOEReport, Finding, Recommendation, Severity } from '@/data/types';

const typedReport = report as FOEReport;

// Types for filters and sorting
type SeverityFilter = 'all' | Severity;
type DimensionFilter = 'all' | 'feedback' | 'understanding' | 'confidence';
type StatusFilter = 'all' | 'failures' | 'gaps' | 'recommendations';
type SortField = 'severity' | 'area' | 'title' | 'type';
type SortDirection = 'asc' | 'desc';
type TabId = 'overview' | 'findings' | 'recommendations' | 'methodology';

// Unified finding type for the table
interface UnifiedFinding {
  id: string;
  type: 'failure' | 'gap' | 'recommendation';
  severity: Severity | 'info';
  area: string;
  title: string;
  description: string;
  details: {
    evidence?: string;
    impact?: string;
    recommendation?: string;
    location?: string;
    priority?: string;
  };
}

// Convert all findings to unified format
function getUnifiedFindings(): UnifiedFinding[] {
  const findings: UnifiedFinding[] = [];

  // Add critical failures
  typedReport.criticalFailures.forEach((f) => {
    findings.push({
      id: f.id,
      type: 'failure',
      severity: f.severity,
      area: f.area,
      title: f.title,
      description: f.impact,
      details: {
        evidence: f.evidence,
        impact: f.impact,
        recommendation: f.recommendation,
        location: f.location,
      },
    });
  });

  // Add gaps
  typedReport.gaps.forEach((g) => {
    findings.push({
      id: g.id,
      type: 'gap',
      severity: g.severity,
      area: g.area,
      title: g.title,
      description: g.impact,
      details: {
        evidence: g.evidence,
        impact: g.impact,
        recommendation: g.recommendation,
      },
    });
  });

  // Add recommendations
  typedReport.recommendations.forEach((r) => {
    const severityMap: Record<string, Severity> = {
      immediate: 'critical',
      'short-term': 'high',
      'medium-term': 'medium',
    };
    findings.push({
      id: r.id,
      type: 'recommendation',
      severity: severityMap[r.priority] || 'low',
      area: 'Improvement',
      title: r.title,
      description: r.description,
      details: {
        priority: r.priority,
        impact: r.impact,
      },
    });
  });

  return findings;
}

// Severity badge component
function SeverityBadge({ severity }: { severity: Severity | 'info' }) {
  const config: Record<Severity | 'info', { bg: string; text: string; icon: React.ElementType }> = {
    critical: { bg: 'bg-red-100 border-red-300', text: 'text-red-700', icon: AlertCircle },
    high: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-700', icon: AlertTriangle },
    medium: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-700', icon: Info },
    low: { bg: 'bg-blue-100 border-blue-300', text: 'text-blue-700', icon: Info },
    info: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', icon: Info },
  };

  const { bg, text, icon: Icon } = config[severity];

  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium', bg, text)}>
      <Icon className="w-3 h-3" />
      {severity.toUpperCase()}
    </span>
  );
}

// Type badge component
function TypeBadge({ type }: { type: 'failure' | 'gap' | 'recommendation' }) {
  const config = {
    failure: { bg: 'bg-red-500', text: 'Failure' },
    gap: { bg: 'bg-amber-500', text: 'Gap' },
    recommendation: { bg: 'bg-emerald-500', text: 'Recommendation' },
  };

  const { bg, text } = config[type];

  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white', bg)}>
      {text}
    </span>
  );
}

// Filter dropdown component
function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-600">{label}:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Summary stat card
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  change?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
        <div className={clsx('p-3 rounded-lg', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Expandable table row
function ExpandableRow({
  finding,
  isExpanded,
  onToggle,
}: {
  finding: UnifiedFinding;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={clsx(
          'cursor-pointer hover:bg-slate-50 transition-colors',
          isExpanded && 'bg-blue-50'
        )}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <button className="text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
        <td className="px-4 py-3">
          <SeverityBadge severity={finding.severity} />
        </td>
        <td className="px-4 py-3">
          <TypeBadge type={finding.type} />
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{finding.area}</td>
        <td className="px-4 py-3 text-sm font-medium text-slate-900">{finding.title}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-blue-50">
          <td colSpan={5} className="px-4 py-4">
            <div className="bg-white rounded-lg border border-blue-200 p-4 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finding.details.evidence && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Evidence
                    </h5>
                    <p className="text-sm text-slate-700">{finding.details.evidence}</p>
                  </div>
                )}
                {finding.details.impact && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Impact
                    </h5>
                    <p className="text-sm text-slate-700">{finding.details.impact}</p>
                  </div>
                )}
                {finding.details.recommendation && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Recommendation
                    </h5>
                    <p className="text-sm text-slate-700">{finding.details.recommendation}</p>
                  </div>
                )}
                {finding.details.location && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Location
                    </h5>
                    <p className="text-sm font-mono text-slate-600">{finding.details.location}</p>
                  </div>
                )}
                {finding.details.priority && (
                  <div>
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Priority
                    </h5>
                    <p className="text-sm text-slate-700 capitalize">{finding.details.priority}</p>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
      <div className="text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'p-2 rounded-lg border',
            currentPage === 1
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border'
            )}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'p-2 rounded-lg border',
            currentPage === totalPages
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Tab button component
function TabButton({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// Overview tab content
function OverviewTab() {
  const dimensions = [
    { key: 'feedback', ...typedReport.dimensions.feedback },
    { key: 'understanding', ...typedReport.dimensions.understanding },
    { key: 'confidence', ...typedReport.dimensions.confidence },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Executive Summary</h3>
        <p className="text-slate-700 leading-relaxed">{typedReport.executiveSummary}</p>
      </div>

      {/* Dimension Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dimensions.map((dim) => (
          <div key={dim.key} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">{dim.name}</h4>
              <span
                className="text-2xl font-bold"
                style={{ color: dim.color }}
              >
                {dim.score}
                <span className="text-sm text-slate-400 font-normal">/{dim.max}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(dim.score / dim.max) * 100}%`,
                  backgroundColor: dim.color,
                }}
              />
            </div>
            <div className="space-y-2">
              {dim.subscores.map((sub) => (
                <div key={sub.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{sub.name}</span>
                  <span className="text-slate-900 font-medium">
                    {sub.score}/{sub.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          Strengths
        </h3>
        <div className="space-y-4">
          {typedReport.strengths.map((s) => (
            <div key={s.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    {s.area}
                  </span>
                  <p className="text-slate-700 mt-1">{s.evidence}</p>
                  {s.caveat && (
                    <p className="text-sm text-slate-500 mt-2 italic">Caveat: {s.caveat}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Findings tab content
function FindingsTab({
  severityFilter,
  statusFilter,
  searchQuery,
  sortField,
  sortDirection,
  onSortChange,
}: {
  severityFilter: SeverityFilter;
  statusFilter: StatusFilter;
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const allFindings = useMemo(() => getUnifiedFindings(), []);

  const filteredFindings = useMemo(() => {
    let filtered = [...allFindings];

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter((f) => f.severity === severityFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const typeMap: Record<string, string> = {
        failures: 'failure',
        gaps: 'gap',
        recommendations: 'recommendation',
      };
      filtered = filtered.filter((f) => f.type === typeMap[statusFilter]);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          f.area.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'severity':
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        case 'area':
          comparison = a.area.localeCompare(b.area);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allFindings, severityFilter, statusFilter, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredFindings.length / itemsPerPage);
  const paginatedFindings = filteredFindings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:bg-slate-100"
      onClick={() => onSortChange(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === 'asc' ? (
            <SortAsc className="w-3 h-3" />
          ) : (
            <SortDesc className="w-3 h-3" />
          ))}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <SortHeader field="severity">Severity</SortHeader>
              <SortHeader field="type">Type</SortHeader>
              <SortHeader field="area">Area</SortHeader>
              <SortHeader field="title">Title</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedFindings.map((finding) => (
              <ExpandableRow
                key={finding.id}
                finding={finding}
                isExpanded={expandedId === finding.id}
                onToggle={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
              />
            ))}
            {paginatedFindings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No findings match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// Recommendations tab content
function RecommendationsTab() {
  const immediate = typedReport.recommendations.filter((r) => r.priority === 'immediate');
  const shortTerm = typedReport.recommendations.filter((r) => r.priority === 'short-term');
  const mediumTerm = typedReport.recommendations.filter((r) => r.priority === 'medium-term');

  const PrioritySection = ({
    title,
    items,
    color,
  }: {
    title: string;
    items: Recommendation[];
    color: string;
  }) => (
    <div className="mb-6">
      <h4
        className={clsx('text-sm font-bold uppercase tracking-wide mb-3 px-3 py-1 rounded inline-block text-white')}
        style={{ backgroundColor: color }}
      >
        {title}
      </h4>
      <div className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-semibold text-slate-900">{r.title}</h5>
                <p className="text-sm text-slate-600 mt-1">{r.description}</p>
              </div>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  r.impact === 'high' && 'bg-red-100 text-red-700',
                  r.impact === 'medium' && 'bg-amber-100 text-amber-700',
                  r.impact === 'low' && 'bg-blue-100 text-blue-700'
                )}
              >
                {r.impact.toUpperCase()} IMPACT
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Prioritized Recommendations</h3>
      {immediate.length > 0 && (
        <PrioritySection title="Immediate" items={immediate} color="#dc2626" />
      )}
      {shortTerm.length > 0 && (
        <PrioritySection title="Short-term" items={shortTerm} color="#f59e0b" />
      )}
      {mediumTerm.length > 0 && (
        <PrioritySection title="Medium-term" items={mediumTerm} color="#3b82f6" />
      )}
    </div>
  );
}

// Methodology tab content
function MethodologyTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Assessment Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{typedReport.methodology.filesAnalyzed}</p>
            <p className="text-sm text-slate-600">Files Analyzed</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{typedReport.methodology.testFilesAnalyzed}</p>
            <p className="text-sm text-slate-600">Test Files Analyzed</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-600">{typedReport.methodology.adrsAnalyzed}</p>
            <p className="text-sm text-slate-600">ADRs Reviewed</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Confidence Notes</h3>
        <ul className="space-y-3">
          {typedReport.methodology.confidenceNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-3 text-slate-700">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Scoring Dimensions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">Feedback</h4>
            <p className="text-sm text-slate-600">
              Measures how quickly and effectively the team receives signals about their work. Includes
              CI/CD pipeline speed, deployment frequency, test coverage, and feedback loop investments.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-600 mb-2">Understanding</h4>
            <p className="text-sm text-slate-600">
              Measures how well the codebase communicates its intent and design. Includes architecture
              clarity, domain modeling, documentation quality, and code organization.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-emerald-600 mb-2">Confidence</h4>
            <p className="text-sm text-slate-600">
              Measures how safely and reliably changes can be made. Includes test quality, contract
              testing, dependency health, and change safety mechanisms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function InteractiveScorecardPage() {
  // Filter states
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [dimensionFilter, setDimensionFilter] = useState<DimensionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Computed stats based on filters
  const allFindings = useMemo(() => getUnifiedFindings(), []);
  const filteredStats = useMemo(() => {
    let filtered = [...allFindings];

    if (severityFilter !== 'all') {
      filtered = filtered.filter((f) => f.severity === severityFilter);
    }
    if (statusFilter !== 'all') {
      const typeMap: Record<string, string> = {
        failures: 'failure',
        gaps: 'gap',
        recommendations: 'recommendation',
      };
      filtered = filtered.filter((f) => f.type === typeMap[statusFilter]);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          f.area.toLowerCase().includes(query)
      );
    }

    return {
      total: filtered.length,
      critical: filtered.filter((f) => f.severity === 'critical').length,
      high: filtered.filter((f) => f.severity === 'high').length,
      medium: filtered.filter((f) => f.severity === 'medium').length,
    };
  }, [allFindings, severityFilter, statusFilter, searchQuery]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSeverityFilter('all');
    setDimensionFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters =
    severityFilter !== 'all' || statusFilter !== 'all' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Templates</span>
            </Link>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h1 className="font-bold text-slate-900">
                FOE Interactive Scorecard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Filter className="w-4 h-4" />
              Template 10: Interactive
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[65px] z-10">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <FilterDropdown
              label="Severity"
              value={severityFilter}
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onChange={(v) => setSeverityFilter(v as SeverityFilter)}
            />

            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'failures', label: 'Failures' },
                { value: 'gaps', label: 'Gaps' },
                { value: 'recommendations', label: 'Recommendations' },
              ]}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
            />

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}

            {/* Export Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Findings"
            value={filteredStats.total}
            change={hasActiveFilters ? 'filtered' : `of ${allFindings.length}`}
            icon={FileText}
            color="bg-blue-600"
          />
          <StatCard
            label="Critical Issues"
            value={filteredStats.critical}
            icon={AlertCircle}
            color="bg-red-600"
          />
          <StatCard
            label="High Priority"
            value={filteredStats.high}
            icon={AlertTriangle}
            color="bg-orange-500"
          />
          <StatCard
            label="Overall Score"
            value={typedReport.overallScore}
            change={`${typedReport.maturityLevel} maturity`}
            icon={BarChart3}
            color="bg-emerald-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={BarChart3}
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            id="findings"
            label="Findings"
            icon={FileText}
            isActive={activeTab === 'findings'}
            onClick={() => setActiveTab('findings')}
          />
          <TabButton
            id="recommendations"
            label="Recommendations"
            icon={Lightbulb}
            isActive={activeTab === 'recommendations'}
            onClick={() => setActiveTab('recommendations')}
          />
          <TabButton
            id="methodology"
            label="Methodology"
            icon={BookOpen}
            isActive={activeTab === 'methodology'}
            onClick={() => setActiveTab('methodology')}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'findings' && (
          <FindingsTab
            severityFilter={severityFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        )}
        {activeTab === 'recommendations' && <RecommendationsTab />}
        {activeTab === 'methodology' && <MethodologyTab />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p className="mb-2">Flow Optimized Engineering - Interactive Scorecard</p>
          <p>
            Assessment generated on{' '}
            {new Date(typedReport.scanDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}
