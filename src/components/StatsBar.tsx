import { knowledgeBase, categoryColors } from '../data/knowledgeBase';
import { BarChart3, BookOpen, Layers, Zap } from 'lucide-react';

export default function StatsBar() {
  const skills = knowledgeBase.skills;
  const avgComplexity = (skills.reduce((sum, s) => sum + s.complexity, 0) / skills.length).toFixed(1);
  const totalFormulas = skills.reduce((sum, s) => sum + s.formulas.length, 0);
  const totalSpecs = skills.reduce((sum, s) => sum + Object.keys(s.specifications).length, 0);

  const categoryCounts = knowledgeBase.metadata.categories.map((cat) => ({
    name: cat,
    count: skills.filter((s) => s.category === cat).length,
    colors: categoryColors[cat],
  }));

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Top stats row */}
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{skills.length}</p>
              <p className="text-xs text-slate-500">Total Skills</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
              <Zap className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalFormulas}</p>
              <p className="text-xs text-slate-500">Formulas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Layers className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalSpecs}</p>
              <p className="text-xs text-slate-500">Specifications</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
              <BarChart3 className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{avgComplexity}</p>
              <p className="text-xs text-slate-500">Avg Complexity</p>
            </div>
          </div>
        </div>

        {/* Category distribution */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500">Categories:</span>
          {categoryCounts.map(({ name, count, colors }) => (
            <span
              key={name}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
            >
              <span>{categoryColors[name].icon}</span>
              {name.replace('_', ' ')}
              <span className="ml-0.5 rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-bold">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
