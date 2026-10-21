import {
  BookOpen,
  Brain,
  Download,
  FolderOpen,
  Monitor,
  Search,
  Sparkles,
} from 'lucide-react';

type AppTab = 'using' | 'train' | 'skills' | 'interpret';

interface UsingGuideProps {
  isDesktop: boolean;
  platform: string;
  onNavigate: (tab: AppTab) => void;
}

const platformLabels: Record<string, string> = {
  darwin: 'macOS',
  linux: 'Linux',
  local: 'Local App',
  win32: 'Windows',
};

export default function UsingGuide({ isDesktop, platform, onNavigate }: UsingGuideProps) {
  const runtimeLabel = isDesktop
    ? `Desktop app on ${platformLabels[platform] ?? platform}`
    : platform === 'local'
    ? 'Local app mode'
    : 'Browser preview mode';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.08),_transparent_35%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <Monitor className="h-3.5 w-3.5 text-indigo-600" />
              {runtimeLabel}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                How to use the SZM desktop app
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This workspace helps you train a local English document model, inspect what it
                learns from your files, ask questions against the learned corpus, and export the
                resulting dataset as JSON.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              onClick={() => onNavigate('train')}
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-indigo-700"
            >
              Open Train Tab
            </button>
            <button
              onClick={() => onNavigate('skills')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
            >
              Browse Skills
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {[
          {
            icon: Brain,
            title: '1. Train',
            description: 'Paste English notes or import text-rich files to build local memory.',
            action: 'Open Train Model',
            tab: 'train' as const,
          },
          {
            icon: Sparkles,
            title: '2. Review',
            description: 'Inspect the learned vocabulary, phrases, and evidence sentences.',
            action: 'Open Learned View',
            tab: 'interpret' as const,
          },
          {
            icon: BookOpen,
            title: '3. Explore',
            description: 'Search and sort the full engineering knowledge base by category or complexity.',
            action: 'Open Skills',
            tab: 'skills' as const,
          },
          {
            icon: Download,
            title: '4. Export',
            description: 'Save the trained corpus and extracted learning signals as JSON.',
            action: 'Use Export Button',
            tab: 'using' as const,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              {item.tab !== 'using' ? (
                <button
                  onClick={() => onNavigate(item.tab)}
                  className="mt-4 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  {item.action}
                </button>
              ) : (
                <p className="mt-4 text-sm font-medium text-indigo-600">{item.action}</p>
              )}
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FolderOpen className="h-5 w-5 text-cyan-600" />
            Input methods
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              Use <span className="font-semibold text-slate-900">Paste Training Data</span> for raw
              English text like notes, specs, prompts, manuals, and documentation.
            </p>
            <p>
              Use <span className="font-semibold text-slate-900">Upload Files</span> for text-based
              documents first. Binary files can be stored too, but text-rich sources teach the model best.
            </p>
            <p>
              {isDesktop
                ? 'Because you are in the desktop app, you can also use the native file picker for a smoother local import flow.'
                : 'In browser preview mode, file import uses the regular browser upload control.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Search className="h-5 w-5 text-emerald-600" />
            Best workflow
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Start in Train Model with one clean English source at a time so the learned output stays readable.</p>
            <p>Review the What Model Learned tab after each import to confirm the extracted terms make sense.</p>
            <p>Use Ask Model to query the local corpus and see which source passages support the answer.</p>
            <p>Use Knowledge Skills when you want full formulas, specs, related skills, and source references.</p>
            <p>Export JSON after you are happy with the trained corpus and want to feed it into your own tooling.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
