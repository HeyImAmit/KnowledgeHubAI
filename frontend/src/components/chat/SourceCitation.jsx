import { BookOpen } from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';

export default function SourceCitation({ citation }) {
  const { openCitationInspector } = useKnowledge();

  if (!citation) return null;

  return (
    <button
      type="button"
      onClick={() => openCitationInspector(citation)}
      className="inline-flex items-center gap-1 px-2 py-0.5 my-0.5 mx-1 text-[11px] font-mono font-medium rounded bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition-colors cursor-pointer group align-baseline shadow-2xs"
      title={`Retrieved from ${citation.documentName} (Page ${citation.page})`}
    >
      <BookOpen className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
      <span className="truncate max-w-[160px] sm:max-w-[200px]">{citation.documentName}</span>
      <span className="text-slate-400 font-sans">·</span>
      <span className="text-slate-500">p. {citation.page}</span>
    </button>
  );
}
