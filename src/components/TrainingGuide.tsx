import { useState } from 'react';
import { BookOpen, ChevronRight, Lightbulb, AlertCircle, ArrowRight } from 'lucide-react';
import { TRAINING_GUIDE_SECTIONS, BEST_PRACTICES, COMMON_MISTAKES } from '@/data/trainingGuide';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

export default function TrainingGuide() {
  const [activeTab, setActiveTab] = useState<string>('guide');
  const [activeSection, setActiveSection] = useState<number>(0);

  const tabs: Tab[] = [
    { id: 'guide', label: 'Training Guide', icon: '📖' },
    { id: 'best-practices', label: 'Best Practices', icon: '⭐' },
    { id: 'mistakes', label: 'Common Mistakes', icon: '🐛' },
  ];

  const renderGuideContent = (): JSX.Element => {
    if (activeTab !== 'guide') return <></>;

    const section = TRAINING_GUIDE_SECTIONS[activeSection];
    if (!section) return <></>;

    return (
      <div className="space-y-4">
        {/* Section Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {TRAINING_GUIDE_SECTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSection(idx)}
              className={`whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium transition-all ${
                activeSection === idx
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {TRAINING_GUIDE_SECTIONS[idx].icon} {idx + 1}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            {section.icon} {section.title}
          </h2>

          <div className="prose prose-sm max-w-none text-slate-700">
            {section.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveSection(Math.min(TRAINING_GUIDE_SECTIONS.length - 1, activeSection + 1))}
              disabled={activeSection === TRAINING_GUIDE_SECTIONS.length - 1}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBestPractices = (): JSX.Element => {
    if (activeTab !== 'best-practices') return <></>;

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">⭐ Best Practices</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {BEST_PRACTICES.map((practice, idx) => (
            <div key={idx} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{practice.title}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  practice.impact === 'high'
                    ? 'bg-red-200 text-red-800'
                    : practice.impact === 'medium'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                }`}>
                  {practice.impact} impact
                </span>
              </div>
              <p className="mb-3 text-sm text-slate-700">{practice.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-block rounded bg-slate-200 px-2 py-1 text-xs text-slate-700">
                  {practice.category}
                </span>
                <span className={`text-xs font-medium ${
                  practice.difficulty === 'beginner'
                    ? 'text-green-700'
                    : practice.difficulty === 'intermediate'
                      ? 'text-yellow-700'
                      : 'text-red-700'
                }`}>
                  {practice.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCommonMistakes = (): JSX.Element => {
    if (activeTab !== 'mistakes') return <></>;

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">🐛 Common Mistakes & Solutions</h2>

        <div className="space-y-4">
          {COMMON_MISTAKES.map((item, idx) => (
            <div key={idx} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-900">❌ {item.mistake}</h3>

              <div className="mb-2 space-y-1 pl-4">
                <p className="text-sm">
                  <span className="font-semibold text-slate-900">Consequence:</span> {item.consequence}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-green-700">✓ Solution:</span> {item.solution}
                </p>
                <p className="text-sm">
                  <span className="font-semibold text-blue-700">💡 Prevention:</span> {item.prevention}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <BookOpen className="h-8 w-8 flex-shrink-0 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">🧠 Complete AI Training Guide</h2>
            <p className="mt-2 text-slate-600">
              Learn best practices, understand the training pipeline, and avoid common pitfalls. This guide is based on years of machine learning research and experience.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 bg-white p-6 pt-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {renderGuideContent()}
        {renderBestPractices()}
        {renderCommonMistakes()}
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <Lightbulb className="h-6 w-6 flex-shrink-0 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-900">💡 Quick Tips</h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li>🎯 Start with good data quality - it's more important than a fancy model</li>
              <li>⚠️ Always split data into train/validation/test BEFORE any preprocessing</li>
              <li>🔍 Monitor your training curves - they tell you what's wrong</li>
              <li>🎁 Use transfer learning whenever possible - pre-trained models are almost always better</li>
              <li>🛑 Implement early stopping to prevent overfitting automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
