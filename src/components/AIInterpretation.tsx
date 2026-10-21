import { AlertCircle, FileText, Layers, Lightbulb, Link2 } from 'lucide-react';
import { LocalLanguageModel } from '@/utils/localLanguageModel';

interface InterpretationProps {
  model: LocalLanguageModel;
}

const typeLabels: Record<string, string> = {
  text: 'Text',
  pdf: 'PDF',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
};

export default function AIInterpretation({ model }: InterpretationProps) {
  if (model.totalDocuments === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <Lightbulb className="mx-auto mb-3 h-12 w-12 text-slate-300" />
        <p className="text-slate-600">No training data yet. Train the local model first using the Train tab.</p>
      </div>
    );
  }

  const latestDocument = model.documents[0];
  const presentTypes = Object.entries(model.documentTypeBreakdown).filter(([, count]) => count > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Latest Learned Source</h3>
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{latestDocument.sourceName}</span>
            <span>•</span>
            <span>{typeLabels[latestDocument.type]}</span>
            <span>•</span>
            <span>{latestDocument.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{latestDocument.timestamp.toLocaleTimeString()}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{latestDocument.preview}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Documents</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{model.totalDocuments}</p>
          <p className="mt-2 text-xs text-slate-500">sources loaded into memory</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Words Learned</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{model.totalWords.toLocaleString()}</p>
          <p className="mt-2 text-xs text-slate-500">across the trained corpus</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Vocabulary</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{model.vocabularySize.toLocaleString()}</p>
          <p className="mt-2 text-xs text-slate-500">unique searchable terms</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Sentence Memory</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">{model.totalSentences.toLocaleString()}</p>
          <p className="mt-2 text-xs text-slate-500">indexed for retrieval</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          Top Concepts
        </h3>

        <div className="flex flex-wrap gap-2">
          {model.topTerms.map((term) => (
            <span
              key={term.term}
              className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900"
            >
              {term.term}
              <span className="ml-2 text-xs text-amber-700">{term.count}</span>
            </span>
          ))}
        </div>
      </div>

      {model.topPhrases.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Link2 className="h-5 w-5 text-green-600" />
            Frequent Phrases
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {model.topPhrases.map((phrase) => (
              <div key={phrase.phrase} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium text-slate-900">{phrase.phrase}</p>
                <p className="mt-1 text-xs text-slate-500">Seen {phrase.count} times in your corpus</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Layers className="h-5 w-5 text-cyan-600" />
            Source Breakdown
          </h3>

          <div className="space-y-3">
            {presentTypes.map(([type, count]) => (
              <div key={type}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{typeLabels[type]}</span>
                  <span className="text-xs font-semibold text-slate-500">{count} source(s)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-cyan-500"
                    style={{ width: `${(count / model.totalDocuments) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-indigo-600" />
            Model Evidence Sentences
          </h3>

          <div className="space-y-3">
            {model.keySentences.map((sentence, index) => (
              <div key={`${sentence}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm leading-6 text-slate-700">{sentence}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Learned Documents</h3>

        <div className="space-y-3">
          {model.documents.map((document) => (
            <div
              key={document.id}
              className="rounded-lg border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{document.sourceName}</p>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {typeLabels[document.type]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{document.representativeSentence}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {document.keyTerms.map((term) => (
                      <span
                        key={`${document.id}-${term.term}`}
                        className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {term.term}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <p>{document.wordCount.toLocaleString()} words</p>
                  <p>{document.sentenceCount.toLocaleString()} sentences</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
          <p className="text-xs text-green-900">
            This local model learns by indexing English text, vocabulary, phrases, and evidence
            sentences from your own data. Ask questions in the Console tab to retrieve answers from
            what you imported.
          </p>
        </div>
      </div>
    </div>
  );
}
