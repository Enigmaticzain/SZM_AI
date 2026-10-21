import { Brain, BookOpen, Sparkles, CircleHelp, Terminal, MessageSquare, Database } from 'lucide-react';

type AppTab = 'using' | 'train' | 'skills' | 'interpret' | 'console' | 'ai-talk' | 'memory';

interface TabSelectorProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  unreadCount?: number;
}

export default function TabSelector({ activeTab, onTabChange, unreadCount = 0 }: TabSelectorProps) {
  const tabs = [
    {
      id: 'using' as const,
      label: 'Using',
      icon: CircleHelp,
      description: 'Quick usage guide',
    },
    {
      id: 'train' as const,
      label: 'Train Model',
      icon: Brain,
      description: 'Paste and import English data',
    },
    {
      id: 'interpret' as const,
      label: 'What Model Learned',
      icon: Sparkles,
      description: 'View learned terms & evidence',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'console' as const,
      label: 'Ask Model',
      icon: Terminal,
      description: 'Query the trained local corpus',
    },
    {
      id: 'ai-talk' as const,
      label: 'AI Conversations',
      icon: MessageSquare,
      description: 'Talk to multiple AIs',
    },
    {
      id: 'memory' as const,
      label: 'Memory',
      icon: Database,
      description: 'Persistent learning system',
    },
    {
      id: 'skills' as const,
      label: 'Knowledge Skills',
      icon: BookOpen,
      description: 'Browse complete knowledge base',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:grid-cols-7">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative rounded-lg px-3 py-2 text-center transition-all text-sm ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Icon className="h-4 w-4" />
              <span className="font-medium text-xs">{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-yellow-400 text-xs font-bold text-slate-900">
                  {tab.badge}
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
              {tab.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
