'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  Hash, 
  Calendar, 
  Tag,
  FileText,
  AlertCircle,
  Zap,
  Target,
  BarChart3,
  Shield,
  Lightbulb,
  BookOpen,
  Home
} from 'lucide-react';
import report from '@/data/report.json';
import type { FOEReport, DimensionScore, Finding, Recommendation, Strength } from '@/data/types';

const typedReport = report as FOEReport;

// Status pill component for inline colored badges
function StatusPill({ 
  status, 
  variant = 'default' 
}: { 
  status: string; 
  variant?: 'default' | 'severity' | 'priority' | 'maturity' | 'confidence';
}) {
  const getColors = () => {
    if (variant === 'severity') {
      switch (status) {
        case 'critical': return 'bg-red-100 text-red-700';
        case 'high': return 'bg-orange-100 text-orange-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        case 'low': return 'bg-gray-100 text-gray-600';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    if (variant === 'priority') {
      switch (status) {
        case 'immediate': return 'bg-red-100 text-red-700';
        case 'short-term': return 'bg-orange-100 text-orange-700';
        case 'medium-term': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    if (variant === 'maturity') {
      switch (status) {
        case 'Emerging': return 'bg-amber-100 text-amber-700';
        case 'Developing': return 'bg-blue-100 text-blue-700';
        case 'Optimized': return 'bg-green-100 text-green-700';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    if (variant === 'confidence') {
      switch (status) {
        case 'high': return 'bg-green-100 text-green-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        case 'low': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
      }
    }
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColors()}`}>
      {status}
    </span>
  );
}

// Collapsible block component
function ToggleBlock({ 
  icon: Icon, 
  title, 
  children, 
  defaultOpen = false,
  badge
}: { 
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 py-2 px-1 -ml-1 rounded hover:bg-gray-50 transition-colors duration-150"
      >
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-gray-900">{title}</span>
        {badge}
      </button>
      
      {isOpen && (
        <div className="ml-6 pl-4 border-l border-gray-100 mt-1 mb-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Checkbox recommendation item
function CheckboxItem({ 
  checked, 
  onToggle, 
  children,
  priority,
  impact
}: { 
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  priority?: string;
  impact?: string;
}) {
  return (
    <div 
      className="flex items-start gap-3 py-2 px-2 -mx-2 rounded hover:bg-gray-50 transition-colors duration-150 cursor-pointer group"
      onClick={onToggle}
    >
      <span className="text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5">
        {checked ? (
          <CheckSquare className="w-4 h-4 text-blue-500" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </span>
      <div className={`flex-1 ${checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {children}
          {priority && <StatusPill status={priority} variant="priority" />}
          {impact && <StatusPill status={`${impact} impact`} />}
        </div>
      </div>
    </div>
  );
}

// Property row for the metadata table
function PropertyRow({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center py-1.5 text-sm group hover:bg-gray-50 -mx-2 px-2 rounded transition-colors duration-150">
      <span className="w-32 text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-900">{children}</span>
    </div>
  );
}

// Dimension block with subscores
function DimensionBlock({ dimension }: { dimension: DimensionScore }) {
  const [isOpen, setIsOpen] = useState(false);
  const percentage = Math.round((dimension.score / dimension.max) * 100);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 py-2 px-1 -ml-1 rounded hover:bg-gray-50 transition-colors duration-150 group"
      >
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0" 
          style={{ backgroundColor: dimension.color }}
        />
        <span className="font-medium text-gray-900 flex-1 text-left">{dimension.name}</span>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%`, backgroundColor: dimension.color }}
            />
          </div>
          <span className="text-sm font-mono text-gray-600 w-12 text-right">
            {dimension.score}/{dimension.max}
          </span>
          <StatusPill status={dimension.confidence} variant="confidence" />
        </div>
      </button>

      {isOpen && (
        <div className="ml-6 pl-4 border-l border-gray-100 mt-2 space-y-4">
          {dimension.subscores.map((subscore, idx) => (
            <div key={idx} className="py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{subscore.name}</span>
                <span className="text-xs font-mono text-gray-500">
                  {subscore.score}/{subscore.max}
                </span>
              </div>
              
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${(subscore.score / subscore.max) * 100}%`,
                    backgroundColor: dimension.color
                  }}
                />
              </div>

              {subscore.evidence.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Evidence</p>
                  <ul className="space-y-0.5">
                    {subscore.evidence.map((e, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {subscore.gaps.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Gaps</p>
                  <ul className="space-y-0.5">
                    {subscore.gaps.map((g, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-1">!</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {subscore.deductions && subscore.deductions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Deductions</p>
                  <ul className="space-y-0.5">
                    {subscore.deductions.map((d, i) => (
                      <li key={i} className="text-xs font-mono text-red-600">{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Finding item component
function FindingItem({ finding }: { finding: Finding }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start gap-2 text-left hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors duration-150 group"
      >
        <span className="text-gray-400 group-hover:text-gray-600 transition-colors mt-0.5">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-900">{finding.title}</span>
            <StatusPill status={finding.severity} variant="severity" />
            <span className="text-xs text-gray-400">{finding.area}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="ml-6 pl-4 border-l border-gray-100 mt-2 space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Evidence: </span>
            <span className="text-gray-700">{finding.evidence}</span>
          </div>
          <div>
            <span className="text-gray-400">Impact: </span>
            <span className="text-gray-700">{finding.impact}</span>
          </div>
          <div>
            <span className="text-gray-400">Recommendation: </span>
            <span className="text-gray-700">{finding.recommendation}</span>
          </div>
          {finding.location && (
            <div>
              <span className="text-gray-400">Location: </span>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{finding.location}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Strength item component
function StrengthItem({ strength }: { strength: Strength }) {
  return (
    <div className="py-2 px-2 -mx-2 rounded hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-start gap-2">
        <span className="text-green-500 mt-0.5">+</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-900">{strength.area}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{strength.evidence}</p>
          {strength.caveat && (
            <p className="text-xs text-gray-400 mt-1 italic">Caveat: {strength.caveat}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotionTemplate() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const dimensions = [
    typedReport.dimensions.feedback,
    typedReport.dimensions.understanding,
    typedReport.dimensions.confidence,
  ];

  const criticalFailures = typedReport.criticalFailures as Finding[];
  const gaps = typedReport.gaps as Finding[];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Templates</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400">Reports</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-700 font-medium">{typedReport.repository}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">
        {/* Page title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          FOE Assessment Report
        </h1>

        {/* Property table */}
        <div className="mb-10 pb-6 border-b border-gray-100">
          <PropertyRow label="Repository">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-gray-400" />
              {typedReport.repository}
            </div>
          </PropertyRow>
          <PropertyRow label="Scan Date">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {typedReport.scanDate}
            </div>
          </PropertyRow>
          <PropertyRow label="Overall Score">
            <span className="font-mono font-semibold">{typedReport.overallScore}/100</span>
          </PropertyRow>
          <PropertyRow label="Maturity Level">
            <StatusPill status={typedReport.maturityLevel} variant="maturity" />
          </PropertyRow>
          <PropertyRow label="Assessment Mode">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              {typedReport.assessmentMode}
            </div>
          </PropertyRow>
          <PropertyRow label="Files Analyzed">
            <span className="font-mono">{typedReport.methodology.filesAnalyzed}</span>
          </PropertyRow>
        </div>

        {/* Executive Summary */}
        <div className="mb-10">
          <p className="text-gray-600 leading-relaxed">{typedReport.executiveSummary}</p>
        </div>

        <hr className="border-gray-100 mb-8" />

        {/* Dimensions */}
        <ToggleBlock 
          icon={BarChart3} 
          title="Dimension Scores" 
          defaultOpen={true}
          badge={
            <span className="text-xs text-gray-400 ml-2">
              {typedReport.overallScore}/100 overall
            </span>
          }
        >
          <div className="mt-4">
            {dimensions.map((dim, idx) => (
              <DimensionBlock key={idx} dimension={dim} />
            ))}
          </div>
        </ToggleBlock>

        <hr className="border-gray-100 my-6" />

        {/* Critical Failures */}
        <ToggleBlock 
          icon={AlertCircle} 
          title="Critical Failures" 
          defaultOpen={true}
          badge={
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
              {criticalFailures.length}
            </span>
          }
        >
          <div className="mt-2">
            {criticalFailures.map((failure) => (
              <FindingItem key={failure.id} finding={failure} />
            ))}
          </div>
        </ToggleBlock>

        <hr className="border-gray-100 my-6" />

        {/* Gaps */}
        <ToggleBlock 
          icon={Target} 
          title="Identified Gaps" 
          badge={
            <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded">
              {gaps.length}
            </span>
          }
        >
          <div className="mt-2">
            {gaps.map((gap) => (
              <FindingItem key={gap.id} finding={gap} />
            ))}
          </div>
        </ToggleBlock>

        <hr className="border-gray-100 my-6" />

        {/* Strengths */}
        <ToggleBlock 
          icon={Shield} 
          title="Strengths" 
          badge={
            <span className="ml-2 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">
              {typedReport.strengths.length}
            </span>
          }
        >
          <div className="mt-2">
            {typedReport.strengths.map((strength) => (
              <StrengthItem key={strength.id} strength={strength} />
            ))}
          </div>
        </ToggleBlock>

        <hr className="border-gray-100 my-6" />

        {/* Recommendations as checkboxes */}
        <ToggleBlock 
          icon={Lightbulb} 
          title="Recommendations" 
          defaultOpen={true}
          badge={
            <span className="ml-2 text-xs text-gray-400">
              {Object.values(checkedItems).filter(Boolean).length}/{typedReport.recommendations.length} complete
            </span>
          }
        >
          <div className="mt-2">
            {typedReport.recommendations.map((rec) => (
              <CheckboxItem
                key={rec.id}
                checked={checkedItems[rec.id] || false}
                onToggle={() => toggleItem(rec.id)}
                priority={rec.priority}
                impact={rec.impact}
              >
                <div>
                  <span className="font-medium">{rec.title}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{rec.description}</p>
                </div>
              </CheckboxItem>
            ))}
          </div>
        </ToggleBlock>

        <hr className="border-gray-100 my-6" />

        {/* Methodology */}
        <ToggleBlock 
          icon={BookOpen} 
          title="Methodology"
        >
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-semibold text-gray-900">{typedReport.methodology.filesAnalyzed}</p>
                <p className="text-xs text-gray-500 mt-1">Files Analyzed</p>
              </div>
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-semibold text-gray-900">{typedReport.methodology.testFilesAnalyzed}</p>
                <p className="text-xs text-gray-500 mt-1">Test Files</p>
              </div>
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-semibold text-gray-900">{typedReport.methodology.adrsAnalyzed}</p>
                <p className="text-xs text-gray-500 mt-1">ADRs</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Confidence Notes</p>
              <ul className="space-y-1">
                {typedReport.methodology.confidenceNotes.map((note, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ToggleBlock>

        {/* Footer spacing */}
        <div className="h-24" />
      </main>
    </div>
  );
}
