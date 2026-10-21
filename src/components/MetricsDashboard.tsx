import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Clock, Zap } from 'lucide-react';
import { ExperimentTracker, ExperimentStats } from '@/utils/experimentTracker';

const tracker = new ExperimentTracker();

export default function MetricsDashboard() {
  const [stats, setStats] = useState<ExperimentStats>({
    totalRuns: 0,
    completedRuns: 0,
    failedRuns: 0,
    pendingRuns: 0,
    avgTrainingTime: 0,
    avgAccuracy: 0,
    bestAccuracy: 0,
  });

  const [selectedRun, setSelectedRun] = useState<string | null>(null);

  useEffect(() => {
    const newStats = tracker.getStats();
    setStats(newStats);
  }, []);

  const bestRun = tracker.getBestRun('accuracy');
  const recentRuns = tracker.getRecentRuns(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <BarChart3 className="h-8 w-8 flex-shrink-0 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">📊 Training Metrics Dashboard</h2>
            <p className="mt-2 text-slate-600">
              Track experiment performance, compare training runs, and monitor improvement over time.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Runs"
          value={stats.totalRuns}
          icon={<BarChart3 className="h-5 w-5" />}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Completed"
          value={stats.completedRuns}
          icon={<Award className="h-5 w-5" />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Failed"
          value={stats.failedRuns}
          icon={<Zap className="h-5 w-5" />}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          label="Pending"
          value={stats.pendingRuns}
          icon={<Clock className="h-5 w-5" />}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Best Accuracy"
          value={`${stats.bestAccuracy.toFixed(1)}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Average Training Time */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Average Training Time</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.avgTrainingTime > 0 ? `${(stats.avgTrainingTime / 60).toFixed(1)}min` : 'N/A'}
          </p>
          <p className="mt-1 text-xs text-slate-600">{stats.completedRuns} runs analyzed</p>
        </div>

        {/* Average Accuracy */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Average Accuracy</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {stats.avgAccuracy > 0 ? `${stats.avgAccuracy.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="mt-1 text-xs text-slate-600">{stats.completedRuns} runs analyzed</p>
        </div>
      </div>

      {/* Best Run Summary */}
      {bestRun && (
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
          <h3 className="font-semibold text-green-900">🏆 Best Performing Run</h3>
          <p className="mt-1 text-sm text-green-800">{bestRun.name}</p>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-green-700">Accuracy</p>
              <p className="text-lg font-bold text-green-900">{bestRun.metrics.accuracy?.toFixed(2)}%</p>
            </div>
            {bestRun.metrics.loss !== undefined && (
              <div>
                <p className="text-xs text-green-700">Loss</p>
                <p className="text-lg font-bold text-green-900">{bestRun.metrics.loss.toFixed(4)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-green-700">Training Time</p>
              <p className="text-lg font-bold text-green-900">{(bestRun.trainingTime / 60).toFixed(1)}min</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Runs */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">📝 Recent Runs</h3>

        {recentRuns.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No training runs yet. Start training to see results here.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentRuns.map(run => (
              <div
                key={run.id}
                className={`cursor-pointer rounded border-l-4 p-3 transition-all hover:bg-slate-50 ${
                  run.status === 'complete' ? 'border-green-500 bg-green-50' : run.status === 'failed' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                }`}
                onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{run.name}</p>
                    <p className="text-xs text-slate-600">{new Date(run.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    {run.status === 'complete' && (
                      <p className="text-sm font-bold text-green-700">{run.metrics.accuracy?.toFixed(1)}%</p>
                    )}
                    <span className={`inline-block rounded px-2 py-1 text-xs font-medium capitalize ${
                      run.status === 'complete'
                        ? 'bg-green-200 text-green-800'
                        : run.status === 'failed'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedRun === run.id && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-600">Model Type</p>
                        <p className="font-medium text-slate-900 capitalize">{run.modelType}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Data Size</p>
                        <p className="font-medium text-slate-900">{run.dataInfo.documentsCount} docs</p>
                      </div>
                      {run.metrics.loss !== undefined && (
                        <div>
                          <p className="text-slate-600">Loss</p>
                          <p className="font-medium text-slate-900">{run.metrics.loss.toFixed(4)}</p>
                        </div>
                      )}
                      {run.metrics.f1 !== undefined && (
                        <div>
                          <p className="text-slate-600">F1 Score</p>
                          <p className="font-medium text-slate-900">{run.metrics.f1.toFixed(3)}</p>
                        </div>
                      )}
                    </div>
                    {run.notes && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-600">Notes: {run.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">📥 Export Data</h3>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              const csv = tracker.exportAsCsv();
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `experiments_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            📊 Export as CSV
          </button>
          <button
            onClick={() => {
              const json = tracker.exportAsJson();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `experiments_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            📄 Export as JSON
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: JSX.Element;
  color: string;
}): JSX.Element {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
