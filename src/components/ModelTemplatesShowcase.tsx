import { useState } from 'react';
import { Brain, ChevronRight, Clock, Zap, Database, BarChart3 } from 'lucide-react';
import { getAllTemplates, getTemplatesByDifficulty, ModelTemplate } from '@/utils/modelTemplates';

export default function ModelTemplatesShowcase() {
  const [selectedTemplate, setSelectedTemplate] = useState<ModelTemplate | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const allTemplates = getAllTemplates();
  const filteredTemplates =
    filterDifficulty === 'all' ? allTemplates : getTemplatesByDifficulty(filterDifficulty);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHardwareIcon = (hw: string): string => {
    if (hw.includes('24')) return '🔥';
    if (hw.includes('12')) return '⚡';
    if (hw.includes('6')) return '💻';
    return '🖥️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Brain className="h-8 w-8 flex-shrink-0 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">🤖 Model Templates</h2>
            <p className="mt-2 text-slate-600">
              Choose from pre-configured templates for different AI model types. Each includes best practices, hyperparameters, and learning resources.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-700">Filter by Difficulty:</p>
        <div className="flex gap-2">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => (
            <button
              key={level}
              onClick={() => setFilterDifficulty(level)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filterDifficulty === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {level === 'all' ? 'All Templates' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{template.name}</h3>
                <p className="text-xs text-slate-600">{template.category}</p>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-700">{template.description}</p>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {template.estimatedTime}
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Min data: {template.minDataSize}
              </div>
              <div className="flex items-center gap-2">
                {getHardwareIcon(template.hardwareRequirement)} {template.hardwareRequirement}
              </div>
            </div>

            <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100">
              View Details
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Template Detail */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

function TemplateDetailModal({
  template,
  onClose,
}: {
  template: ModelTemplate;
  onClose: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{template.name}</h2>
              <p className="mt-1 text-slate-600">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatItem label="Difficulty" value={template.difficulty} />
            <StatItem label="Est. Time" value={template.estimatedTime} />
            <StatItem label="Min Data" value={template.minDataSize} />
            <StatItem label="Hardware" value={template.hardwareRequirement} />
          </div>

          {/* Hyperparameters */}
          <div>
            <h3 className="mb-3 font-semibold text-slate-900">⚙️ Recommended Hyperparameters</h3>
            <div className="overflow-x-auto rounded-lg bg-slate-50 p-4">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(template.hyperparameters).map(([key, value]) => (
                    <tr key={key} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-4 py-2 font-medium text-slate-700">{key}</td>
                      <td className="px-4 py-2 font-mono text-slate-900">
                        {typeof value === 'number' ? value.toExponential(2) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Training Strategy */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">📈 Training Strategy</h3>
            <p className="text-sm text-slate-700">{template.trainingStrategy.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-blue-50 p-2">
                <p className="text-slate-600">Epochs</p>
                <p className="font-bold text-slate-900">{template.trainingStrategy.epochs}</p>
              </div>
              <div className="rounded bg-green-50 p-2">
                <p className="text-slate-600">Val Split</p>
                <p className="font-bold text-slate-900">{(template.trainingStrategy.validationSplit * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded bg-yellow-50 p-2">
                <p className="text-slate-600">Early Stop</p>
                <p className="font-bold text-slate-900">{template.trainingStrategy.earlyStoppingPatience}</p>
              </div>
            </div>
          </div>

          {/* Preprocessing */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">🔄 Data Preprocessing</h3>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Normalization:</span> {template.dataPreprocessing.normalization}
            </p>
            {template.dataPreprocessing.augmentation.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-700">Augmentation Techniques:</p>
                <ul className="mt-1 space-y-1">
                  {template.dataPreprocessing.augmentation.map((aug, idx) => (
                    <li key={idx} className="text-sm text-slate-600">
                      • {aug}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Best Practices */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">⭐ Best Practices</h3>
            <ul className="space-y-1">
              {template.bestPractices.map((practice, idx) => (
                <li key={idx} className="text-sm text-slate-700">
                  ✓ {practice}
                </li>
              ))}
            </ul>
          </div>

          {/* Common Pitfalls */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">⚠️ Common Pitfalls</h3>
            <ul className="space-y-1">
              {template.commonPitfalls.map((pitfall, idx) => (
                <li key={idx} className="text-sm text-slate-700">
                  ✗ {pitfall}
                </li>
              ))}
            </ul>
          </div>

          {/* Evaluation Metrics */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">📊 Evaluation Metrics</h3>
            <div className="flex flex-wrap gap-2">
              {template.evaluationMetrics.map((metric, idx) => (
                <span key={idx} className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {metric}
                </span>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-2 font-semibold text-slate-900">📚 Resources</h3>
            <ul className="space-y-2">
              {template.resources.map((resource, idx) => (
                <li key={idx}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🔗 {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 border-t border-slate-200 pt-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              Close
            </button>
            <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700">
              Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="mt-1 font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  );
}
