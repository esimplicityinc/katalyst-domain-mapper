'use client'

import Link from 'next/link'
import report from '@/data/report.json'
import { FOEReport, DimensionScore, Finding, SubScore } from '@/data/types'

const typedReport = report as FOEReport

// Grade thresholds: F: 0-25, D: 26-50, C: 51-65, B: 66-80, A: 81-100
function getLetterGrade(score: number, max: number = 100): string {
  const percentage = (score / max) * 100
  if (percentage <= 25) return 'F'
  if (percentage <= 50) return 'D'
  if (percentage <= 65) return 'C'
  if (percentage <= 80) return 'B'
  return 'A'
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return 'bg-emerald-500 text-white'
    case 'B': return 'bg-blue-500 text-white'
    case 'C': return 'bg-yellow-500 text-white'
    case 'D': return 'bg-orange-500 text-white'
    case 'F': return 'bg-red-600 text-white'
    default: return 'bg-gray-500 text-white'
  }
}

function getGradeBorderColor(grade: string): string {
  switch (grade) {
    case 'A': return 'border-emerald-500'
    case 'B': return 'border-blue-500'
    case 'C': return 'border-yellow-500'
    case 'D': return 'border-orange-500'
    case 'F': return 'border-red-600'
    default: return 'border-gray-500'
  }
}

function getGradeTextColor(grade: string): string {
  switch (grade) {
    case 'A': return 'text-emerald-600'
    case 'B': return 'text-blue-600'
    case 'C': return 'text-yellow-600'
    case 'D': return 'text-orange-600'
    case 'F': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

function GradeBox({ grade, size = 'md' }: { grade: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-32 h-32 text-7xl',
  }
  
  return (
    <div className={`${sizeClasses[size]} ${getGradeColor(grade)} rounded-lg flex items-center justify-center font-bold shadow-md border-2 border-black/10`}>
      {grade}
    </div>
  )
}

function PassFailBadge({ pass }: { pass: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${
      pass ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
    }`}>
      {pass ? 'PASS' : 'FAIL'}
    </span>
  )
}

function TeacherComment({ children, type = 'improvement' }: { children: React.ReactNode; type?: 'improvement' | 'praise' | 'warning' }) {
  const styles = {
    improvement: 'bg-amber-50 border-l-4 border-amber-400 text-amber-900',
    praise: 'bg-emerald-50 border-l-4 border-emerald-400 text-emerald-900',
    warning: 'bg-red-50 border-l-4 border-red-400 text-red-900',
  }
  
  const icons = {
    improvement: 'pencil',
    praise: 'star',
    warning: 'alert',
  }
  
  return (
    <div className={`${styles[type]} p-4 rounded-r-lg my-3 italic`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">
          {type === 'improvement' && '...'}
          {type === 'praise' && '***'}
          {type === 'warning' && '!!!'}
        </span>
        <div className="font-serif">{children}</div>
      </div>
    </div>
  )
}

function GradeRubric() {
  const rubric = [
    { grade: 'A', range: '81-100', description: 'Excellent - Industry leading practices, comprehensive coverage' },
    { grade: 'B', range: '66-80', description: 'Good - Strong foundations with minor gaps to address' },
    { grade: 'C', range: '51-65', description: 'Satisfactory - Basic practices in place, significant room for improvement' },
    { grade: 'D', range: '26-50', description: 'Needs Improvement - Minimal practices, major gaps present' },
    { grade: 'F', range: '0-25', description: 'Failing - Critical deficiencies, immediate action required' },
  ]
  
  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
      <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Grading Scale</h3>
      <div className="space-y-2">
        {rubric.map(({ grade, range, description }) => (
          <div key={grade} className="flex items-center gap-3 text-sm">
            <GradeBox grade={grade} size="sm" />
            <span className="font-mono text-gray-500 w-16">{range}</span>
            <span className="text-gray-700">{description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SubjectRow({ subject, score, max, subscores }: { subject: string; score: number; max: number; subscores: SubScore[] }) {
  const grade = getLetterGrade(score, max)
  const percentage = Math.round((score / max) * 100)
  
  return (
    <>
      <tr className="border-b-2 border-gray-300 bg-white hover:bg-gray-50">
        <td className="py-4 px-4 font-semibold text-gray-900">{subject}</td>
        <td className="py-4 px-4 text-center">
          <GradeBox grade={grade} size="md" />
        </td>
        <td className="py-4 px-4 text-center">
          <span className="font-mono text-lg">{score}</span>
          <span className="text-gray-400">/{max}</span>
        </td>
        <td className="py-4 px-4 text-center">
          <span className={`font-bold ${getGradeTextColor(grade)}`}>{percentage}%</span>
        </td>
        <td className="py-4 px-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${grade === 'F' ? 'bg-red-500' : grade === 'D' ? 'bg-orange-500' : grade === 'C' ? 'bg-yellow-500' : grade === 'B' ? 'bg-blue-500' : 'bg-emerald-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </td>
      </tr>
      {subscores.map((subscore, idx) => {
        const subGrade = getLetterGrade(subscore.score, subscore.max)
        const subPercentage = Math.round((subscore.score / subscore.max) * 100)
        return (
          <tr key={idx} className="border-b border-gray-200 bg-gray-50/50 text-sm">
            <td className="py-2 px-4 pl-8 text-gray-600">- {subscore.name}</td>
            <td className="py-2 px-4 text-center">
              <GradeBox grade={subGrade} size="sm" />
            </td>
            <td className="py-2 px-4 text-center">
              <span className="font-mono">{subscore.score}</span>
              <span className="text-gray-400">/{subscore.max}</span>
            </td>
            <td className="py-2 px-4 text-center">
              <span className={`${getGradeTextColor(subGrade)}`}>{subPercentage}%</span>
            </td>
            <td className="py-2 px-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${subGrade === 'F' ? 'bg-red-400' : subGrade === 'D' ? 'bg-orange-400' : subGrade === 'C' ? 'bg-yellow-400' : subGrade === 'B' ? 'bg-blue-400' : 'bg-emerald-400'}`}
                  style={{ width: `${subPercentage}%` }}
                />
              </div>
            </td>
          </tr>
        )
      })}
    </>
  )
}

function CriticalItemsTable({ items }: { items: Finding[] }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100 border-b-2 border-gray-300">
          <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Critical Requirement</th>
          <th className="py-2 px-4 text-center text-sm font-semibold text-gray-700 w-24">Status</th>
          <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Evidence</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4">
              <div className="font-medium text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-500 mt-1">{item.area}</div>
            </td>
            <td className="py-3 px-4 text-center">
              <PassFailBadge pass={false} />
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">
              {item.evidence}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function ReportCardTemplate() {
  const overallGrade = getLetterGrade(typedReport.overallScore)
  const dimensions = Object.values(typedReport.dimensions) as DimensionScore[]
  
  // Calculate GPA (A=4, B=3, C=2, D=1, F=0)
  const gradeToGPA: Record<string, number> = { 'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0 }
  const dimensionGrades = dimensions.map(d => getLetterGrade(d.score, d.max))
  const gpa = (dimensionGrades.reduce((sum, g) => sum + gradeToGPA[g], 0) / dimensions.length).toFixed(2)
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Template Selection
          </Link>
        </div>

        {/* Report Card Container */}
        <div className="bg-white shadow-xl border-4 border-gray-800 rounded-lg overflow-hidden">
          {/* Header - Like a school report card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-300 mb-1">Flow Optimized Engineering</div>
                <h1 className="text-3xl font-bold">Official Assessment Report Card</h1>
                <div className="text-slate-300 mt-1">Engineering Practices Evaluation</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-slate-300">Academic Term</div>
                <div className="text-xl font-semibold">{new Date(typedReport.scanDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</div>
              </div>
            </div>
          </div>

          {/* Student Info Section */}
          <div className="bg-slate-50 border-b-2 border-slate-300 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Repository Name</div>
                <div className="font-bold text-lg text-gray-900">{typedReport.repository}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assessment Date</div>
                <div className="font-semibold text-gray-900">{new Date(typedReport.scanDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assessment Mode</div>
                <div className="font-semibold text-gray-900 capitalize">{typedReport.assessmentMode}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Maturity Level</div>
                <div className="font-semibold text-gray-900">{typedReport.maturityLevel}</div>
              </div>
            </div>
          </div>

          {/* Overall Grade Display */}
          <div className="p-8 border-b-2 border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Overall Grade</h2>
                <p className="text-gray-600 max-w-md">
                  Based on comprehensive evaluation across Feedback, Understanding, and Confidence dimensions.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Cumulative Score:</span>
                    <span className="ml-2 font-bold text-xl">{typedReport.overallScore}/100</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">GPA:</span>
                    <span className="ml-2 font-bold text-xl">{gpa}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <GradeBox grade={overallGrade} size="xl" />
                <div className={`mt-2 text-lg font-semibold ${getGradeTextColor(overallGrade)}`}>
                  {overallGrade === 'F' && 'Failing'}
                  {overallGrade === 'D' && 'Needs Improvement'}
                  {overallGrade === 'C' && 'Satisfactory'}
                  {overallGrade === 'B' && 'Good'}
                  {overallGrade === 'A' && 'Excellent'}
                </div>
              </div>
            </div>
          </div>

          {/* Grades by Subject Table */}
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-slate-700 text-white rounded flex items-center justify-center text-sm">I</span>
              Subject Grades
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th className="py-3 px-4 text-left">Subject</th>
                    <th className="py-3 px-4 text-center w-24">Grade</th>
                    <th className="py-3 px-4 text-center w-24">Score</th>
                    <th className="py-3 px-4 text-center w-24">Percent</th>
                    <th className="py-3 px-4 text-center w-48">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map((dim) => (
                    <SubjectRow 
                      key={dim.name}
                      subject={dim.name}
                      score={dim.score}
                      max={dim.max}
                      subscores={dim.subscores}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Items - Pass/Fail */}
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center text-sm">II</span>
              Critical Requirements (Pass/Fail)
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              These items must pass for the repository to be considered production-ready. Any failing item requires immediate attention.
            </p>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <CriticalItemsTable items={typedReport.criticalFailures.filter(f => f.severity === 'critical')} />
            </div>
          </div>

          {/* Teacher Comments / Room for Improvement */}
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm">III</span>
              Instructor Comments
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Summary Assessment</h3>
                <p className="text-gray-700 italic font-serif">&quot;{typedReport.executiveSummary}&quot;</p>
              </div>

              {typedReport.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Areas of Achievement</h3>
                  {typedReport.strengths.map((strength) => (
                    <TeacherComment key={strength.id} type="praise">
                      <strong>{strength.area}:</strong> {strength.evidence}
                      {strength.caveat && <span className="block text-sm mt-1 not-italic text-amber-700">Note: {strength.caveat}</span>}
                    </TeacherComment>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Room for Improvement</h3>
                {typedReport.gaps.map((gap) => (
                  <TeacherComment key={gap.id} type="improvement">
                    <strong>{gap.title}:</strong> {gap.evidence}
                    <span className="block text-sm mt-1 not-italic text-amber-800">Recommendation: {gap.recommendation}</span>
                  </TeacherComment>
                ))}
              </div>

              {typedReport.criticalFailures.filter(f => f.severity === 'high').length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Serious Concerns</h3>
                  {typedReport.criticalFailures.filter(f => f.severity === 'high').map((failure) => (
                    <TeacherComment key={failure.id} type="warning">
                      <strong>{failure.title}:</strong> {failure.impact}
                    </TeacherComment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grading Rubric */}
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-600 text-white rounded flex items-center justify-center text-sm">IV</span>
              Grading Rubric
            </h2>
            <GradeRubric />
          </div>

          {/* Action Plan / Recommendations */}
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-sm">V</span>
              Improvement Plan
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              Recommended actions to improve grades, prioritized by urgency.
            </p>
            <div className="space-y-3">
              {typedReport.recommendations.map((rec, idx) => {
                const priorityStyles = {
                  immediate: 'border-l-4 border-red-500 bg-red-50',
                  'short-term': 'border-l-4 border-orange-500 bg-orange-50',
                  'medium-term': 'border-l-4 border-blue-500 bg-blue-50',
                }
                return (
                  <div key={rec.id} className={`${priorityStyles[rec.priority]} p-4 rounded-r-lg`}>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-gray-400 text-sm">{idx + 1}.</span>
                      <div>
                        <div className="font-semibold text-gray-900">{rec.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className={`px-2 py-0.5 rounded ${
                            rec.priority === 'immediate' ? 'bg-red-200 text-red-800' :
                            rec.priority === 'short-term' ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded ${
                            rec.impact === 'high' ? 'bg-emerald-200 text-emerald-800' :
                            rec.impact === 'medium' ? 'bg-gray-200 text-gray-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {rec.impact} impact
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer / Signature Area */}
          <div className="bg-slate-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assessment Methodology</div>
                <div className="text-sm text-gray-600">
                  {typedReport.methodology.filesAnalyzed} files analyzed | {typedReport.methodology.testFilesAnalyzed} test files | {typedReport.methodology.adrsAnalyzed} ADRs reviewed
                </div>
              </div>
              <div className="text-right">
                <div className="border-t-2 border-gray-400 pt-2 px-8">
                  <div className="font-serif italic text-gray-600">FOE Assessment Engine</div>
                  <div className="text-xs text-gray-500">Automated Analysis</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              This report card was generated automatically by the Flow Optimized Engineering assessment system.
              <br />
              For questions about this assessment, please consult the FOE documentation.
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 px-4 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Template Selection
          </Link>
        </div>
      </div>
    </div>
  )
}
