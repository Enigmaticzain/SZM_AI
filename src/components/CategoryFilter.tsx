import { knowledgeBase, categoryColors, categoryDescriptions } from '../data/knowledgeBase';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const categories = knowledgeBase.metadata.categories;
  const skills = knowledgeBase.skills;

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelect(null)}
        className={`w-full rounded-xl border p-3 text-left transition-all ${
          selected === null
            ? 'border-indigo-300 bg-indigo-50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${selected === null ? 'text-indigo-700' : 'text-slate-700'}`}>
            All Categories
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              selected === null ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {skills.length}
          </span>
        </div>
      </button>

      {categories.map((cat) => {
        const colors = categoryColors[cat];
        const count = skills.filter((s) => s.category === cat).length;
        const isActive = selected === cat;

        return (
          <button
            key={cat}
            onClick={() => onSelect(isActive ? null : cat)}
            className={`w-full rounded-xl border p-3 text-left transition-all ${
              isActive
                ? `${colors.border} ${colors.bg} shadow-sm`
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{colors.icon}</span>
                <span className={`text-sm font-medium ${isActive ? colors.text : 'text-slate-700'}`}>
                  {cat.replace('_', ' ')}
                </span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  isActive ? `${colors.bg} ${colors.text}` : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </div>
            <p className="mt-1 pl-7 text-[11px] text-slate-400 leading-tight">
              {categoryDescriptions[cat]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
