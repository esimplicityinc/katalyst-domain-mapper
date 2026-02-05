'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  Stethoscope,
  ArrowLeft,
  FileHeart,
  Thermometer,
  Syringe,
  ShieldAlert,
  Clock,
  AlertCircle,
  CheckCircle,
  Cross,
  HeartPulse,
  ClipboardList,
} from 'lucide-react';
import { clsx } from 'clsx';
import report from '@/data/report.json';
import type { FOEReport, DimensionScore, Finding, Recommendation } from '@/data/types';

const typedReport = report as FOEReport;

// Medical status helpers
type MedicalStatus = 'critical' | 'warning' | 'healthy';

function getVitalStatus(score: number, max: number): MedicalStatus {
  const percentage = (score / max) * 100;
  if (percentage < 40) return 'critical';
  if (percentage < 70) return 'warning';
  return 'healthy';
}

function getOverallStatus(score: number): MedicalStatus {
  if (score < 40) return 'critical';
  if (score < 70) return 'warning';
  return 'healthy';
}

// Animated Pulse Component
function PulseIndicator({ status }: { status: MedicalStatus }) {
  const colors = {
    critical: 'bg-red-500',
    warning: 'bg-amber-500',
    healthy: 'bg-emerald-500',
  };

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={clsx(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colors[status]
        )}
      />
      <span
        className={clsx(
          'relative inline-flex rounded-full h-3 w-3',
          colors[status]
        )}
      />
    </span>
  );
}

// Medical Alert Badge
function MedicalBadge({ status, size = 'md' }: { status: MedicalStatus; size?: 'sm' | 'md' | 'lg' }) {
  const config = {
    critical: {
      bg: 'bg-red-600',
      border: 'border-red-700',
      text: 'CRITICAL',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-500',
      border: 'border-amber-600',
      text: 'WARNING',
      icon: AlertTriangle,
    },
    healthy: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-600',
      text: 'HEALTHY',
      icon: CheckCircle,
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const { bg, border, text, icon: Icon } = config[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-bold text-white rounded border-2 uppercase tracking-wide',
        bg,
        border,
        sizeClasses[size]
      )}
    >
      <Icon className="w-4 h-4" />
      {text}
    </span>
  );
}

// Heartbeat Animation Line
function HeartbeatLine({ status }: { status: MedicalStatus }) {
  const colors = {
    critical: 'stroke-red-500',
    warning: 'stroke-amber-500',
    healthy: 'stroke-emerald-500',
  };

  return (
    <svg className="w-full h-8" viewBox="0 0 200 30" preserveAspectRatio="none">
      <path
        d="M0,15 L30,15 L35,15 L40,5 L45,25 L50,10 L55,20 L60,15 L90,15 L95,15 L100,5 L105,25 L110,10 L115,20 L120,15 L150,15 L155,15 L160,5 L165,25 L170,10 L175,20 L180,15 L200,15"
        fill="none"
        className={clsx('stroke-2', colors[status])}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="stroke-dasharray"
          values="0,200;200,0"
          dur={status === 'critical' ? '0.8s' : status === 'warning' ? '1.2s' : '1.6s'}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

// Vital Signs Monitor Card
function VitalSign({
  name,
  score,
  max,
  icon: Icon,
  color,
}: {
  name: string;
  score: number;
  max: number;
  icon: React.ElementType;
  color: string;
}) {
  const status = getVitalStatus(score, max);
  const percentage = Math.round((score / max) * 100);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color }} />
          <span className="text-slate-300 font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <PulseIndicator status={status} />
          <MedicalBadge status={status} size="sm" />
        </div>
      </div>

      {/* Digital readout style */}
      <div className="bg-black rounded p-3 mb-3 font-mono">
        <div className="flex items-baseline justify-between">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-slate-500 text-lg">/ {max}</span>
        </div>
        <div className="text-xs text-slate-600 mt-1">
          {percentage}% CAPACITY
        </div>
      </div>

      <HeartbeatLine status={status} />
    </div>
  );
}

// Patient Info Card
function PatientCard() {
  const status = getOverallStatus(typedReport.overallScore);

  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header with red cross pattern */}
      <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded">
            <Cross className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">PATIENT RECORD</h2>
            <p className="text-red-200 text-sm">Engineering Health Assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PulseIndicator status={status} />
          <MedicalBadge status={status} size="lg" />
        </div>
      </div>

      {/* Patient details */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Patient ID
            </label>
            <p className="text-slate-900 font-bold mt-1">{typedReport.repository}</p>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Exam Date
            </label>
            <p className="text-slate-900 font-medium mt-1">
              {new Date(typedReport.scanDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Overall Health Score
            </label>
            <p className="text-3xl font-bold mt-1" style={{
              color: status === 'critical' ? '#dc2626' : status === 'warning' ? '#f59e0b' : '#10b981'
            }}>
              {typedReport.overallScore}
              <span className="text-slate-400 text-lg font-normal">/100</span>
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Condition
            </label>
            <p className={clsx(
              'font-bold text-lg mt-1',
              typedReport.maturityLevel === 'Emerging' && 'text-red-600',
              typedReport.maturityLevel === 'Developing' && 'text-amber-600',
              typedReport.maturityLevel === 'Optimized' && 'text-emerald-600'
            )}>
              {typedReport.maturityLevel}
            </p>
          </div>
        </div>

        {/* Assessment type badge */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-sm text-slate-600">
            <Stethoscope className="w-4 h-4" />
            Assessment Mode: <span className="font-medium uppercase">{typedReport.assessmentMode}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Diagnosis Section
function DiagnosisSection() {
  const status = getOverallStatus(typedReport.overallScore);

  return (
    <div className="bg-white border-l-4 border-l-blue-500 rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <FileHeart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-blue-900 font-bold text-lg">DIAGNOSIS</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-slate-700 leading-relaxed text-lg">
          {typedReport.executiveSummary}
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          Diagnosis confidence: <span className="font-medium text-slate-700">HIGH</span>
        </div>
      </div>
    </div>
  );
}

// Vital Signs Monitor
function VitalSignsMonitor() {
  const dimensions = [
    { key: 'feedback', icon: Activity, dimension: typedReport.dimensions.feedback },
    { key: 'understanding', icon: Thermometer, dimension: typedReport.dimensions.understanding },
    { key: 'confidence', icon: HeartPulse, dimension: typedReport.dimensions.confidence },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 animate-pulse" />
        <h3 className="text-white font-bold text-lg">VITAL SIGNS MONITOR</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dimensions.map(({ key, icon, dimension }) => (
          <VitalSign
            key={key}
            name={dimension.name}
            score={dimension.score}
            max={dimension.max}
            icon={icon}
            color={dimension.color}
          />
        ))}
      </div>

      {/* Methodology footer */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span>{typedReport.methodology.filesAnalyzed} files analyzed</span>
          <span>{typedReport.methodology.testFilesAnalyzed} test files</span>
          <span>{typedReport.methodology.adrsAnalyzed} ADRs reviewed</span>
        </div>
      </div>
    </div>
  );
}

// Symptoms Section (Critical Failures)
function SymptomsSection() {
  const criticalSymptoms = typedReport.criticalFailures.filter(f => f.severity === 'critical');
  const severeSymptoms = typedReport.criticalFailures.filter(f => f.severity === 'high');

  return (
    <div className="bg-white border-l-4 border-l-red-500 rounded-lg shadow-md overflow-hidden">
      <div className="bg-red-50 px-6 py-4 border-b border-red-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-full">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-red-900 font-bold text-lg">SYMPTOMS DETECTED</h3>
          </div>
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {typedReport.criticalFailures.length} ISSUES
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Critical symptoms */}
        {criticalSymptoms.length > 0 && (
          <div className="p-6">
            <h4 className="text-red-700 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Life-Threatening Conditions ({criticalSymptoms.length})
            </h4>
            <div className="space-y-4">
              {criticalSymptoms.map((symptom) => (
                <SymptomCard key={symptom.id} symptom={symptom} severity="critical" />
              ))}
            </div>
          </div>
        )}

        {/* Severe symptoms */}
        {severeSymptoms.length > 0 && (
          <div className="p-6">
            <h4 className="text-amber-700 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Serious Conditions ({severeSymptoms.length})
            </h4>
            <div className="space-y-4">
              {severeSymptoms.map((symptom) => (
                <SymptomCard key={symptom.id} symptom={symptom} severity="high" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SymptomCard({ symptom, severity }: { symptom: Finding; severity: 'critical' | 'high' }) {
  const isCritical = severity === 'critical';

  return (
    <div
      className={clsx(
        'rounded-lg p-4 border-l-4',
        isCritical
          ? 'bg-red-50 border-l-red-500'
          : 'bg-amber-50 border-l-amber-500'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <PulseIndicator status={isCritical ? 'critical' : 'warning'} />
            <span className={clsx(
              'text-xs font-bold uppercase',
              isCritical ? 'text-red-600' : 'text-amber-600'
            )}>
              {symptom.area}
            </span>
          </div>
          <h5 className="font-bold text-slate-900 mb-2">{symptom.title}</h5>
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-medium">Evidence:</span> {symptom.evidence}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Prognosis:</span> {symptom.impact}
          </p>
          {symptom.location && (
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Location: {symptom.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Prescription Section (Recommendations)
function PrescriptionSection() {
  const immediate = typedReport.recommendations.filter(r => r.priority === 'immediate');
  const shortTerm = typedReport.recommendations.filter(r => r.priority === 'short-term');
  const mediumTerm = typedReport.recommendations.filter(r => r.priority === 'medium-term');

  return (
    <div className="bg-white border-l-4 border-l-emerald-500 rounded-lg shadow-md overflow-hidden">
      <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-full">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-emerald-900 font-bold text-lg">PRESCRIPTION</h3>
          </div>
          <span className="text-emerald-700 text-sm">
            {typedReport.recommendations.length} treatments prescribed
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Immediate (STAT) */}
        {immediate.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                STAT
              </span>
              <span className="text-slate-700 font-medium">Administer Immediately</span>
            </div>
            <div className="space-y-3">
              {immediate.map((rx) => (
                <PrescriptionCard key={rx.id} rx={rx} dosage="STAT" />
              ))}
            </div>
          </div>
        )}

        {/* Short-term (Daily) */}
        {shortTerm.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                QD
              </span>
              <span className="text-slate-700 font-medium">Daily Treatment (1-2 weeks)</span>
            </div>
            <div className="space-y-3">
              {shortTerm.map((rx) => (
                <PrescriptionCard key={rx.id} rx={rx} dosage="QD" />
              ))}
            </div>
          </div>
        )}

        {/* Medium-term (Weekly) */}
        {mediumTerm.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                QW
              </span>
              <span className="text-slate-700 font-medium">Weekly Treatment (1-3 months)</span>
            </div>
            <div className="space-y-3">
              {mediumTerm.map((rx) => (
                <PrescriptionCard key={rx.id} rx={rx} dosage="QW" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prescription footer */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Syringe className="w-4 h-4" />
          <span>Follow treatment plan in order of priority for optimal recovery</span>
        </div>
      </div>
    </div>
  );
}

function PrescriptionCard({ rx, dosage }: { rx: Recommendation; dosage: string }) {
  const impactColors = {
    high: 'text-red-600 bg-red-50 border-red-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-4">
      <div className="bg-slate-100 rounded px-2 py-1 text-xs font-mono text-slate-600">
        Rx #{rx.id.split('-')[1]}
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-slate-900 mb-1">{rx.title}</h5>
        <p className="text-sm text-slate-600">{rx.description}</p>
      </div>
      <div className={clsx(
        'px-2 py-1 rounded border text-xs font-medium',
        impactColors[rx.impact]
      )}>
        {rx.impact.toUpperCase()} IMPACT
      </div>
    </div>
  );
}

// Gaps as Secondary Findings
function SecondaryFindingsSection() {
  return (
    <div className="bg-white border-l-4 border-l-amber-500 rounded-lg shadow-md overflow-hidden">
      <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-full">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-amber-900 font-bold text-lg">SECONDARY FINDINGS</h3>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {typedReport.gaps.map((gap) => (
          <div key={gap.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx(
                'px-2 py-0.5 rounded text-xs font-bold uppercase',
                gap.severity === 'high' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-800'
              )}>
                {gap.severity}
              </span>
              <span className="text-amber-800 text-sm font-medium">{gap.area}</span>
            </div>
            <h5 className="font-bold text-slate-900 mb-2">{gap.title}</h5>
            <p className="text-sm text-slate-600">{gap.evidence}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Page Component
export default function HealthCheckPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Heart className="w-12 h-12 text-red-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
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
              <Heart className="w-6 h-6 text-red-500" />
              <h1 className="font-bold text-slate-900">
                FOE Health Diagnostic Report
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Stethoscope className="w-4 h-4" />
              Template 4: Health Check
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Patient Info Card */}
        <PatientCard />

        {/* Vital Signs Monitor */}
        <VitalSignsMonitor />

        {/* Diagnosis */}
        <DiagnosisSection />

        {/* Two column layout for symptoms and prescription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Symptoms (Critical Failures) */}
          <SymptomsSection />

          {/* Prescription (Recommendations) */}
          <PrescriptionSection />
        </div>

        {/* Secondary Findings (Gaps) */}
        <SecondaryFindingsSection />

        {/* Confidence Notes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-slate-600" />
            Diagnostic Confidence Notes
          </h3>
          <ul className="space-y-2">
            {typedReport.methodology.confidenceNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cross className="w-4 h-4 text-red-500" />
            <span>Flow Optimized Engineering Health Diagnostic</span>
          </div>
          <p>
            This diagnostic report was generated on{' '}
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
