import { useState, useEffect } from 'react';
import { Brain, Trash2, Download, Upload, BarChart3, Clock } from 'lucide-react';
import { memorySystem, MemoryEntry, MemorySession } from '@/utils/memorySystem';

interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  totalSessions: number;
  averageConfidence: number;
  topicsDiscussed: string[];
}

export default function MemoryPanel() {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [sessions, setSessions] = useState<MemorySession[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load memories and stats
    const allMemories = memorySystem.getAllMemories();
    const allSessions = memorySystem.getAllSessions();
    const currentStats = memorySystem.getStats();

    setMemories(allMemories);
    setSessions(allSessions);
    setStats(currentStats);
  }, [refreshTrigger]);

  const filteredMemories = memories.filter((mem) => {
    if (searchQuery && !mem.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType && mem.type !== selectedType) {
      return false;
    }
    return true;
  });

  const handleDeleteMemory = (id: string) => {
    if (window.confirm('Delete this memory?')) {
      memorySystem.deleteMemory(id);
      setRefreshTrigger((t) => t + 1);
    }
  };

  const handleRateMemory = (id: string, rating: 'positive' | 'negative' | 'neutral') => {
    memorySystem.rateMemory(id, rating);
    setRefreshTrigger((t) => t + 1);
  };

  const handleExportMemory = () => {
    const json = memorySystem.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMemory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = memorySystem.importJSON(content);
        alert(`Imported ${result.memories} memories and ${result.sessions} sessions`);
        setRefreshTrigger((t) => t + 1);
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearOld = () => {
    const daysToKeep = prompt('Keep memories from last X days?', '30');
    if (!daysToKeep) return;

    const days = parseInt(daysToKeep, 10);
    if (isNaN(days)) {
      alert('Invalid number');
      return;
    }

    const deleted = memorySystem.cleanupOldMemories(days);
    alert(`Deleted ${deleted} old memories`);
    setRefreshTrigger((t) => t + 1);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear ALL memories? This cannot be undone.')) {
      memorySystem.clearAll();
      setRefreshTrigger((t) => t + 1);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'answer':
        return 'bg-green-100 text-green-800';
      case 'web-search':
        return 'bg-purple-100 text-purple-800';
      case 'ai-conversation':
        return 'bg-orange-100 text-orange-800';
      case 'skill':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm text-slate-600">Total Memories</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalMemories}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(stats.averageConfidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-slate-600">Topics</p>
                <p className="text-2xl font-bold text-slate-900">{stats.topicsDiscussed.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <label className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50">
          <Upload className="inline h-4 w-4 mr-2" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportMemory}
            className="hidden"
          />
        </label>

        <button
          onClick={handleExportMemory}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        <button
          onClick={handleClearOld}
          className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
        >
          Clean Memories
        </button>

        <button
          onClick={handleClearAll}
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Clear All
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search memories..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <select
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value || null)}
          className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All Types</option>
          <option value="question">Questions</option>
          <option value="answer">Answers</option>
          <option value="web-search">Web Searches</option>
          <option value="ai-conversation">AI Conversations</option>
          <option value="skill">Skills</option>
          <option value="interaction">Interactions</option>
        </select>
      </div>

      {/* Memories List */}
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Memories ({filteredMemories.length})</h3>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredMemories.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No memories found</p>
          ) : (
            filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(memory.type)}`}>
                        {memory.type.replace('-', ' ')}
                      </span>
                      {memory.source && (
                        <span className="text-xs text-slate-600">← {memory.source}</span>
                      )}
                      <span className="text-xs text-slate-500">
                        {memory.confidence && `${(memory.confidence * 100).toFixed(0)}%`}
                      </span>
                      {memory.rating && (
                        <span className="text-xs">
                          {memory.rating === 'positive' ? '👍' : memory.rating === 'negative' ? '👎' : '✓'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-700 line-clamp-2">{memory.content}</p>

                    {memory.relevantTerms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {memory.relevantTerms.slice(0, 5).map((term, i) => (
                          <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                            {term}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-slate-500">
                      {new Date(memory.createdAt).toLocaleDateString()} · Accessed {memory.accessCount} times
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleRateMemory(memory.id, 'positive')}
                      className="px-2 py-1 text-sm hover:bg-green-100 rounded"
                      title="Rate positive"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleRateMemory(memory.id, 'negative')}
                      className="px-2 py-1 text-sm hover:bg-red-100 rounded"
                      title="Rate negative"
                    >
                      👎
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="px-2 py-1 text-sm text-red-600 hover:bg-red-100 rounded"
                      title="Delete memory"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Recent Sessions ({sessions.length})</h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sessions.slice(-10).map((session) => (
              <div key={session.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-slate-900">
                    {new Date(session.startTime).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-600">
                    {session.endTime
                      ? `${Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000)}s`
                      : 'Active'}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {session.totalInteractions} interactions ·
                  {session.aiSourcesUsed.length > 0 && ` Sources: ${session.aiSourcesUsed.join(', ')}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
