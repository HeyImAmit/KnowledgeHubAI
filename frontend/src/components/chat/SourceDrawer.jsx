import { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Check, 
  Copy, 
  ExternalLink
} from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function SourceDrawer() {
  const { 
    activeCitation, 
    isSourceDrawerOpen, 
    closeCitationInspector,
    documents,
    setSelectedDocForDetails
  } = useKnowledge();

  const [copied, setCopied] = useState(false);

  if (!isSourceDrawerOpen || !activeCitation) return null;

  const matchedDoc = documents.find((d) => d.name === activeCitation.documentName);

  const handleCopySnippet = () => {
    if (activeCitation?.snippet) {
      navigator.clipboard.writeText(activeCitation.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleInspectDocument = () => {
    if (matchedDoc) {
      setSelectedDocForDetails(matchedDoc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={closeCitationInspector}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">
                  Retrieved Source Context
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  RAG Chunk Inspector
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCitationInspector}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Document metadata banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {activeCitation.documentName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Page {activeCitation.page}
                  </div>
                </div>

                {activeCitation.score && (
                  <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
                    Similarity {activeCitation.score}
                  </Badge>
                )}
              </div>

              {matchedDoc && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>{matchedDoc.author || 'Author not indexed'}</span>
                  <button
                    type="button"
                    onClick={handleInspectDocument}
                    className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                  >
                    <span>View doc</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Verbatim extracted chunk text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Indexed Snippet Content
                </label>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy snippet</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                {activeCitation.snippet}
              </div>
            </div>

            {/* Explanation / Verification Notice */}
            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/70 text-amber-900 text-xs leading-relaxed">
              <span className="font-semibold">Citation Attribution:</span> This text chunk was matched through dense vector similarity search and provided as grounding context to synthesize the answer.
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={closeCitationInspector}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
