import { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import CategoryFilter from './components/CategoryFilter';
import SkillCard from './components/SkillCard';
import SkillDetail from './components/SkillDetail';
import ComplexityChart from './components/ComplexityChart';
import ValidationPanel from './components/ValidationPanel';
import JsonPreview from './components/JsonPreview';
import TabSelector from './components/TabSelector';
import TrainingInterface from './components/TrainingInterface';
import AIInterpretation from './components/AIInterpretation';
import UsingGuide from './components/UsingGuide';
import Console from './components/Console';
import AIConversation from './components/AIConversation';
import MemoryPanel from './components/MemoryPanel';
import { knowledgeBase, Skill } from './data/knowledgeBase';
import {
  buildLocalLanguageModel,
  loadTrainingHistoryFromStorage,
  TrainingData,
} from './utils/localLanguageModel';
import { memorySystem } from './utils/memorySystem';

type AppTab = 'using' | 'train' | 'skills' | 'interpret' | 'console' | 'ai-talk' | 'memory';
const TRAINING_STORAGE_KEY = 'szm-local-language-model-training-v1';

export default function App() {
  const desktop = window.desktop;
  const [activeTab, setActiveTab] = useState<AppTab>('using');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'complexity' | 'title'>('id');
  const [trainingHistory, setTrainingHistory] = useState<TrainingData[]>(() =>
    loadTrainingHistoryFromStorage(TRAINING_STORAGE_KEY)
  );

  const filteredSkills = useMemo(() => {
    let skills = knowledgeBase.skills;

    // Filter by category
    if (selectedCategory) {
      skills = skills.filter((s) => s.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query) ||
          s.keyPoints.some((kp) => kp.toLowerCase().includes(query)) ||
          s.formulas.some((f) => f.toLowerCase().includes(query)) ||
          Object.values(s.specifications).some((v) => v.toLowerCase().includes(query)) ||
          s.applications.some((a) => a.toLowerCase().includes(query)) ||
          s.source.toLowerCase().includes(query)
      );
    }

    // Sort
    skills = [...skills].sort((a, b) => {
      if (sortBy === 'complexity') return b.complexity - a.complexity;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.id.localeCompare(b.id);
    });

    return skills;
  }, [selectedCategory, searchQuery, sortBy]);

  const localModel = useMemo(() => buildLocalLanguageModel(trainingHistory), [trainingHistory]);

  useEffect(() => {
    window.localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(trainingHistory));
  }, [trainingHistory]);

  const handleExport = useCallback(async () => {
    const exportPayload =
      trainingHistory.length > 0
        ? {
            metadata: {
              type: 'local-language-model-corpus',
              exportedAt: new Date().toISOString(),
              documentCount: localModel.totalDocuments,
              wordCount: localModel.totalWords,
              vocabularySize: localModel.vocabularySize,
              sentenceCount: localModel.totalSentences,
            },
            documents: trainingHistory.map((entry) => ({
              id: entry.id,
              type: entry.type,
              fileName: entry.fileName,
              mimeType: entry.mimeType,
              timestamp: entry.timestamp.toISOString(),
              wordCount: entry.wordCount,
              extractedText: entry.extractedText,
            })),
            insights: {
              topTerms: localModel.topTerms,
              topPhrases: localModel.topPhrases,
              keySentences: localModel.keySentences,
              documentTypeBreakdown: localModel.documentTypeBreakdown,
            },
          }
        : knowledgeBase;
    const suggestedName =
      trainingHistory.length > 0 ? 'szm-trained-local-corpus.json' : 'szm-drone-knowledge-base.json';
    const jsonString = JSON.stringify(exportPayload, null, 2);

    if (window.desktop?.exportKnowledgeBase) {
      try {
        await window.desktop.exportKnowledgeBase(jsonString, suggestedName);
      } catch (error) {
        alert('Unable to export the trained corpus from the desktop app.');
      }
      return;
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [localModel, trainingHistory]);

  const handleNavigateSkill = useCallback((skillId: string) => {
    const skill = knowledgeBase.skills.find((s) => s.id === skillId);
    if (skill) {
      setSelectedSkill(skill);
    }
  }, []);

  const handleTrainModel = useCallback((data: TrainingData) => {
    setTrainingHistory((prev) => [data, ...prev]);
    setActiveTab('interpret');
  }, []);

  const handleClearTraining = useCallback(() => {
    setTrainingHistory([]);
    setActiveTab('train');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        onExport={handleExport}
        searchQuery={activeTab === 'skills' ? searchQuery : ''}
        onSearchChange={activeTab === 'skills' ? setSearchQuery : () => {}}
        runtime={{
          isDesktop: Boolean(desktop?.isDesktop),
          platform: desktop?.platform ?? (window.location.protocol === 'file:' ? 'local' : 'browser'),
        }}
      />
      <StatsBar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tab Selector */}
        <div className="mb-6">
          <TabSelector
            activeTab={activeTab}
            onTabChange={setActiveTab}
            unreadCount={trainingHistory.length}
          />
        </div>

        {/* USING TAB */}
        {activeTab === 'using' && (
          <UsingGuide
            isDesktop={Boolean(desktop?.isDesktop)}
            platform={desktop?.platform ?? 'browser'}
            onNavigate={setActiveTab}
          />
        )}

        {/* TRAIN TAB */}
        {activeTab === 'train' && (
          <TrainingInterface
            onTrain={handleTrainModel}
            onClearTraining={handleClearTraining}
            trainingHistory={trainingHistory}
          />
        )}

        {/* INTERPRETATION TAB */}
        {activeTab === 'interpret' && (
          <AIInterpretation model={localModel} />
        )}

        {/* CONSOLE TAB */}
        {activeTab === 'console' && (
          <div className="h-[600px]">
            <Console model={localModel} />
          </div>
        )}

        {/* AI CONVERSATION TAB */}
        {activeTab === 'ai-talk' && (
          <div className="h-[600px]">
            <AIConversation localModel={localModel} />
          </div>
        )}

        {/* MEMORY TAB */}
        {activeTab === 'memory' && (
          <MemoryPanel />
        )}

        {/* SKILLS TAB (Knowledge Base Browser) */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
              <ComplexityChart />
              <ValidationPanel />
            </aside>

            {/* Main content */}
            <div className="lg:col-span-9 space-y-5">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="text-sm text-slate-600">
                  Showing{' '}
                  <span className="font-bold text-slate-900">{filteredSkills.length}</span>{' '}
                  of {knowledgeBase.skills.length} skills
                  {selectedCategory && (
                    <span className="ml-1">
                      in <span className="font-semibold text-indigo-600">{selectedCategory.replace('_', ' ')}</span>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="ml-1">
                      matching "<span className="font-semibold text-indigo-600">{searchQuery}</span>"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sort:</span>
                  {(['id', 'complexity', 'title'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        sortBy === s
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {s === 'id' ? 'ID' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill detail panel (shown when a skill is selected) */}
              {selectedSkill && (
                <SkillDetail
                  skill={selectedSkill}
                  onClose={() => setSelectedSkill(null)}
                  onNavigate={handleNavigateSkill}
                />
              )}

              {/* Skill cards grid */}
              {filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {filteredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onClick={() =>
                        setSelectedSkill(selectedSkill?.id === skill.id ? null : skill)
                      }
                      isSelected={selectedSkill?.id === skill.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <div className="mb-3 text-4xl">🔍</div>
                  <p className="text-lg font-semibold text-slate-700">No skills found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Try adjusting your search or category filter
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="mt-4 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-100"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* JSON preview */}
              <JsonPreview />

              {/* Footer */}
              <footer className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs text-slate-400">
                  Local English Corpus Trainer — Drone & Machine Engineering Knowledge Base v{knowledgeBase.metadata.version}
                  <br />
                  {knowledgeBase.metadata.totalSkills} skills across {knowledgeBase.metadata.categories.length} categories
                  — Use the Train, Learned, and Ask tabs to build and inspect your own local model
                </p>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
