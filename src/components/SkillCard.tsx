import { Skill, categoryColors } from '../data/knowledgeBase';
import { ChevronRight, BookOpen } from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onClick: () => void;
  isSelected: boolean;
}

export default function SkillCard({ skill, onClick, isSelected }: SkillCardProps) {
  const colors = categoryColors[skill.category];

  const complexityColor =
    skill.complexity <= 3
      ? 'text-green-600 bg-green-50 border-green-200'
      : skill.complexity <= 6
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : skill.complexity <= 8
          ? 'text-orange-600 bg-orange-50 border-orange-200'
          : 'text-red-600 bg-red-50 border-red-200';

  const complexityLabel =
    skill.complexity <= 3
      ? 'Beginner'
      : skill.complexity <= 6
        ? 'Intermediate'
        : skill.complexity <= 8
          ? 'Advanced'
          : 'Expert';

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 ${
        isSelected
          ? `${colors.border} ${colors.bg} shadow-md ring-2 ring-${colors.text.replace('text-', '')}/20`
          : 'border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Category & ID */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text} ${colors.border} border`}
            >
              {colors.icon} {skill.category.replace('_', ' ')}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              {skill.id}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-1 text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
            {skill.title}
          </h3>

          {/* Description preview */}
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {skill.description}
          </p>

          {/* Mini stats */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {skill.formulas.length} formulas
            </span>
            <span>•</span>
            <span>{Object.keys(skill.specifications).length} specs</span>
            <span>•</span>
            <span>{skill.applications.length} applications</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Complexity badge */}
          <div className={`rounded-lg border px-2 py-1 text-center ${complexityColor}`}>
            <div className="text-lg font-bold leading-none">{skill.complexity}</div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-wider">{complexityLabel}</div>
          </div>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              isSelected ? 'rotate-90 text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'
            }`}
          />
        </div>
      </div>
    </button>
  );
}
