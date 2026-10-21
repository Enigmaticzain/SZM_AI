import {
  X,
  BookOpen,
  Lightbulb,
  Sigma,
  Settings2,
  Target,
  Link2,
  FileText,
} from 'lucide-react';
import { Skill, categoryColors, knowledgeBase } from '../data/knowledgeBase';

interface SkillDetailProps {
  skill: Skill;
  onClose: () => void;
  onNavigate: (skillId: string) => void;
}

export default function SkillDetail({ skill, onClose, onNavigate }: SkillDetailProps) {
  const colors = categoryColors[skill.category];

  const complexityPercent = (skill.complexity / 10) * 100;

  const complexityLabel =
    skill.complexity <= 3
      ? 'Beginner'
      : skill.complexity <= 6
        ? 'Intermediate'
        : skill.complexity <= 8
          ? 'Advanced'
          : 'Expert';

  const relatedSkillsData = skill.relatedSkills
    .map((id) => knowledgeBase.skills.find((s) => s.id === id))
    .filter(Boolean) as Skill[];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      {/* Header */}
      <div className={`relative bg-gradient-to-r ${colors.gradient} p-6`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
            {colors.icon}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-xs text-white/90">
                {skill.id}
              </span>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs text-white/90">
                {skill.category.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{skill.title}</h2>
          </div>
        </div>

        {/* Complexity bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium text-white/80">Complexity</span>
          <div className="flex-1 overflow-hidden rounded-full bg-white/20 h-2">
            <div
              className={`h-full rounded-full bg-white transition-all duration-500`}
              style={{ width: `${complexityPercent}%` }}
            />
          </div>
          <span className="min-w-[60px] rounded-full bg-white/20 px-2 py-0.5 text-center text-xs font-bold text-white">
            {skill.complexity}/10 {complexityLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[calc(100vh-340px)] overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <section>
          <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Description" />
          <p className="text-sm leading-relaxed text-slate-600">{skill.description}</p>
        </section>

        {/* Key Points */}
        <section>
          <SectionTitle icon={<Lightbulb className="h-4 w-4" />} title="Key Points" />
          <ul className="space-y-2">
            {skill.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Formulas */}
        <section>
          <SectionTitle icon={<Sigma className="h-4 w-4" />} title="Formulas" />
          <div className="space-y-2">
            {skill.formulas.map((formula, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800"
              >
                {formula}
              </div>
            ))}
          </div>
        </section>

        {/* Specifications */}
        <section>
          <SectionTitle icon={<Settings2 className="h-4 w-4" />} title="Specifications" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(skill.specifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-xs font-medium text-slate-500 break-all">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="flex-shrink-0 text-right text-xs font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Applications */}
        <section>
          <SectionTitle icon={<Target className="h-4 w-4" />} title="Applications" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {skill.applications.map((app, i) => (
              <div
                key={i}
                className={`rounded-lg border ${colors.border} ${colors.bg} px-3 py-2.5`}
              >
                <span className={`text-xs leading-relaxed ${colors.text}`}>{app}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Related Skills */}
        {relatedSkillsData.length > 0 && (
          <section>
            <SectionTitle icon={<Link2 className="h-4 w-4" />} title="Related Skills" />
            <div className="flex flex-wrap gap-2">
              {relatedSkillsData.map((related) => {
                const relColors = categoryColors[related.category];
                return (
                  <button
                    key={related.id}
                    onClick={() => onNavigate(related.id)}
                    className={`inline-flex items-center gap-2 rounded-lg border ${relColors.border} ${relColors.bg} px-3 py-2 text-left transition-all hover:shadow-md`}
                  >
                    <span className="text-sm">{relColors.icon}</span>
                    <div>
                      <span className={`block text-xs font-semibold ${relColors.text}`}>{related.title}</span>
                      <span className="block font-mono text-[10px] text-slate-400">{related.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Source */}
        <section>
          <SectionTitle icon={<FileText className="h-4 w-4" />} title="Source" />
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs italic text-slate-600">{skill.source}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
      <span className="text-indigo-500">{icon}</span>
      {title}
    </h3>
  );
}
