import { Download, Database, Cpu, Search, Monitor } from 'lucide-react';
import { knowledgeBase } from '../data/knowledgeBase';

interface HeaderProps {
  onExport: () => void | Promise<void>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  runtime: {
    isDesktop: boolean;
    platform: string;
  };
}

const platformLabels: Record<string, string> = {
  darwin: 'macOS',
  linux: 'Linux',
  local: 'Local App',
  win32: 'Windows',
};

export default function Header({ onExport, searchQuery, onSearchChange, runtime }: HeaderProps) {
  const runtimeLabel = runtime.isDesktop
    ? `Desktop • ${platformLabels[runtime.platform] ?? runtime.platform}`
    : runtime.platform === 'local'
    ? 'Local App'
    : 'Browser Preview';

  return (
    <header className="relative overflow-hidden border-b border-slate-800 bg-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Glow effects */}
      <div className="absolute -top-24 left-1/4 h-48 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute -top-24 right-1/4 h-48 w-96 rounded-full bg-cyan-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/30">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  SZM Autonomous Offline System
                </h1>
                <p className="text-sm text-slate-400">
                  Local document-learning workstation for English training data and engineering knowledge
                </p>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
              <Monitor className="h-3.5 w-3.5" />
              {runtimeLabel}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-400" />
                {knowledgeBase.metadata.totalSkills} Skills
              </span>
              <span className="text-slate-600">•</span>
              <span>{knowledgeBase.metadata.categories.length} Categories</span>
              <span className="text-slate-600">•</span>
              <span>v{knowledgeBase.metadata.version}</span>
              <span className="text-slate-600">•</span>
              <span>{knowledgeBase.metadata.createdAt}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search skills, formulas, specs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-72"
              />
            </div>
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
