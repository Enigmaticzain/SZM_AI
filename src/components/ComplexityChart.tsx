import { knowledgeBase, categoryColors } from '../data/knowledgeBase';

export default function ComplexityChart() {
  const skills = knowledgeBase.skills;
  const maxComplexity = 10;

  // Group by category
  const categories = knowledgeBase.metadata.categories;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-700">
        Complexity Distribution
      </h3>

      <div className="space-y-3">
        {categories.map((cat) => {
          const catSkills = skills.filter((s) => s.category === cat);
          if (catSkills.length === 0) return null;
          const avgComplexity = catSkills.reduce((sum, s) => sum + s.complexity, 0) / catSkills.length;
          const colors = categoryColors[cat];

          return (
            <div key={cat}>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span>{colors.icon}</span>
                  {cat.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-slate-700">{avgComplexity.toFixed(1)}/10</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-700`}
                  style={{ width: `${(avgComplexity / maxComplexity) * 100}%` }}
                />
              </div>
              <div className="mt-1 flex gap-1">
                {catSkills.map((s) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} opacity-60`}
                    style={{ width: `${100 / catSkills.length}%` }}
                    title={`${s.title}: ${s.complexity}/10`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-slate-500">1-3 Beginner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-[10px] text-slate-500">4-6 Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span className="text-[10px] text-slate-500">7-8 Advanced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[10px] text-slate-500">9-10 Expert</span>
        </div>
      </div>
    </div>
  );
}
