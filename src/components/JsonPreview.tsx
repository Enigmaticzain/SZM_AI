import { useState } from 'react';
import { Copy, Check, Code2, ChevronDown, ChevronRight } from 'lucide-react';
import { knowledgeBase } from '../data/knowledgeBase';

export default function JsonPreview() {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const jsonString = JSON.stringify(knowledgeBase, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Code2 className="h-4 w-4 text-indigo-500" />
          Raw JSON Output
          <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {(jsonString.length / 1024).toFixed(1)} KB
          </span>
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-all hover:bg-indigo-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy JSON
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="max-h-96 overflow-auto bg-slate-950 p-4">
          <pre className="text-xs leading-relaxed text-slate-300">
            <code>{jsonString}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
