import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { DataQualityMetrics, ValidationIssue } from '@/utils/dataValidation';

interface DataQualityPanelProps {
  metrics: DataQualityMetrics;
  fileName?: string;
}

export default function DataQualityPanel({ metrics, fileName }: DataQualityPanelProps) {
  const getReadinessColor = (readiness: string): string => {
    switch (readiness) {
      case 'excellent':
        return 'border-green-200 bg-green-50';
      case 'good':
        return 'border-blue-200 bg-blue-50';
      case 'fair':
        return 'border-yellow-200 bg-yellow-50';
      case 'poor':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getReadinessBadgeColor = (readiness: string): string => {
    switch (readiness) {
      case 'excellent':
        return 'bg-green-200 text-green-800';
      case 'good':
        return 'bg-blue-200 text-blue-800';
      case 'fair':
        return 'bg-yellow-200 text-yellow-800';
      case 'poor':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderIssueIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className={`rounded-lg border-2 p-5 ${getReadinessColor(metrics.readiness)}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Data Quality Analysis</h3>
          {fileName && <p className="mt-1 text-sm text-slate-600">{fileName}</p>}
        </div>
        <div className="flex flex-col items-end">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${getReadinessBadgeColor(metrics.readiness)}`}>
            {metrics.readiness}
          </span>
          <p className={`mt-2 text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>{metrics.overallScore}%</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Content Length" value={`${(metrics.contentLength / 1024).toFixed(1)} KB`} />
        <MetricCard label="Word Count" value={metrics.wordCount.toString()} />
        <MetricCard label="Unique Words" value={metrics.uniqueWords.toString()} />
        <MetricCard label="Sentences" value={metrics.sentenceCount.toString()} />
      </div>

      {/* Score Breakdown */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Readability</span>
          <span className="text-sm font-bold text-slate-900">{metrics.readabilityScore}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-blue-500" style={{ width: `${metrics.readabilityScore}%` }} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-slate-700">Content Diversity</span>
          <span className="text-sm font-bold text-slate-900">{metrics.contentDiversity}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-purple-500" style={{ width: `${metrics.contentDiversity}%` }} />
        </div>
      </div>

      {/* Issues */}
      {metrics.issues.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">⚠️ Issues Found ({metrics.issues.length})</h4>
          <div className="space-y-2">
            {metrics.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2 rounded bg-white px-3 py-2">
                {renderIssueIcon(issue.type)}
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-900">{issue.message}</p>
                  <p className="text-xs text-slate-600 capitalize">Severity: {issue.severity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CheckCircle className="h-4 w-4" />
          Recommendations
        </h4>
        <ul className="space-y-1">
          {[
            metrics.overallScore >= 80 ? '✓ Content quality is excellent!' : null,
            metrics.wordCount < 50 ? '→ Add more content for better results' : null,
            metrics.readabilityScore < 30 ? '→ Use simpler language and shorter sentences' : null,
            metrics.contentDiversity < 40 ? '→ Add more vocabulary variety' : null,
            metrics.issues.length > 0 ? `→ Fix ${metrics.issues.length} validation issue(s)` : null,
          ]
            .filter(Boolean)
            .map((rec, idx) => (
              <li key={idx} className="text-xs text-slate-700">
                {rec}
              </li>
            ))}
        </ul>
      </div>

      {/* Training Recommendation */}
      <div className="mt-4 rounded bg-white p-3">
        <p className="text-xs font-medium text-slate-900">
          {metrics.readiness === 'excellent' && '✨ Ready for training! This data looks great.'}
          {metrics.readiness === 'good' && '👍 Good quality. Ready to train with solid results.'}
          {metrics.readiness === 'fair' && '⚠️ Fair quality. May get reasonable results but could be improved.'}
          {metrics.readiness === 'poor' && '🔧 Poor quality. Recommend improvements before training.'}
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded bg-white px-2 py-2 text-center">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
