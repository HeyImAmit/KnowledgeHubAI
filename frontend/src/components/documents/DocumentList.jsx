import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MessageSquare, 
  Info, 
  Trash2
} from 'lucide-react';
import DocumentStatus from './DocumentStatus';
import { useKnowledge } from '../../context/useKnowledge';

export default function DocumentList({ documents }) {
  const navigate = useNavigate();
  const { setSelectedDocForDetails, deleteDocument } = useKnowledge();

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Pages</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Uploaded</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr 
                key={doc.id}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => setSelectedDocForDetails(doc)}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 max-w-xs md:max-w-sm">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {doc.author || 'Technical Manual'}
                        {doc.topics && doc.topics.length > 0 && ` · ${doc.topics.slice(0, 2).join(', ')}`}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {doc.type}
                  </span>
                </td>

                <td className="py-3.5 px-3 font-mono text-slate-600">
                  {doc.pages}
                </td>

                <td className="py-3.5 px-3 font-mono text-slate-600">
                  {doc.size}
                </td>

                <td className="py-3.5 px-3">
                  <DocumentStatus status={doc.status} size="sm" />
                </td>

                <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                  {doc.uploadedAt}
                </td>

                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDocForDetails(doc)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Inspect Metadata"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {doc.status === 'Indexed' && (
                      <button
                        type="button"
                        onClick={() => navigate(`/chat?doc=${encodeURIComponent(doc.name)}`)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Query in AI Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => deleteDocument(doc.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
