import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Trash2, 
  Info
} from 'lucide-react';
import DocumentStatus from './DocumentStatus';
import { useKnowledge } from '../../context/useKnowledge';

export default function DocumentCard({ document }) {
  const navigate = useNavigate();
  const { setSelectedDocForDetails, deleteDocument } = useKnowledge();

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4.5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h3 
                onClick={() => setSelectedDocForDetails(document)}
                className="text-sm font-semibold text-slate-900 truncate hover:text-indigo-600 cursor-pointer transition-colors"
                title={document.name}
              >
                {document.name}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {document.author || 'Technical Document'}
              </p>
            </div>
          </div>

          <DocumentStatus status={document.status} size="sm" />
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed">
          {document.summary || 'No summary available.'}
        </p>

        {/* Topics */}
        {document.topics && document.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {document.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200/60"
              >
                {topic}
              </span>
            ))}
            {document.topics.length > 3 && (
              <span className="text-[10px] font-medium bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200/60">
                +{document.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Action Bar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>{document.pages} pages</span>
          <span>•</span>
          <span>{document.size}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDocForDetails(document)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Inspect Details"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {document.status === 'Indexed' && (
            <button
              type="button"
              onClick={() => navigate(`/chat?doc=${encodeURIComponent(document.name)}`)}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Query in AI Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => deleteDocument(document.id)}
            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Remove Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
