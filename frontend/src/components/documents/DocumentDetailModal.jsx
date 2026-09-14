import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  RefreshCw, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Modal from '../common/Modal';
import DocumentStatus from './DocumentStatus';
import Button from '../common/Button';
import { useKnowledge } from '../../context/useKnowledge';

export default function DocumentDetailModal() {
  const navigate = useNavigate();
  const { 
    selectedDocForDetails, 
    setSelectedDocForDetails, 
    deleteDocument, 
    retryDocument 
  } = useKnowledge();

  if (!selectedDocForDetails) return null;

  const doc = selectedDocForDetails;

  const handleQueryInChat = () => {
    setSelectedDocForDetails(null);
    navigate(`/chat?doc=${encodeURIComponent(doc.name)}`);
  };

  const handleDelete = () => {
    deleteDocument(doc.id);
  };

  const handleRetry = () => {
    retryDocument(doc.id);
    setSelectedDocForDetails(null);
  };

  return (
    <Modal
      isOpen={Boolean(selectedDocForDetails)}
      onClose={() => setSelectedDocForDetails(null)}
      title={doc.name}
      subtitle={`Indexed Document Metadata · ${doc.type}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Status & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Pipeline Status:</span>
            <DocumentStatus status={doc.status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
            <span>{doc.pages} pages</span>
            <span>•</span>
            <span>{doc.size}</span>
            {doc.chunksCount > 0 && (
              <>
                <span>•</span>
                <span>{doc.chunksCount} chunks</span>
              </>
            )}
          </div>
        </div>

        {/* Failed error message banner */}
        {doc.status === 'Failed' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Ingestion Pipeline Error</span>
            </div>
            <p className="text-xs text-rose-700">
              {doc.errorMessage || 'An error occurred during OCR text extraction and embedding generation.'}
            </p>
            <Button
              size="sm"
              variant="danger"
              icon={RefreshCw}
              onClick={handleRetry}
              className="text-xs mt-1"
            >
              Retry Ingestion
            </Button>
          </div>
        )}

        {/* Overview & Summary */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
            Document Summary
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 border border-slate-200 rounded-md">
            {doc.summary || 'No summary extracted for this document.'}
          </p>
        </div>

        {/* Topics */}
        {doc.topics && doc.topics.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              Extracted Semantic Topics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {doc.topics.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
          <div className="space-y-1">
            <span className="text-slate-400">Author / Source</span>
            <p className="font-medium text-slate-800">{doc.author || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Uploaded Time</span>
            <p className="font-medium text-slate-800">{doc.uploadedAt}</p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Vector Embeddings</span>
            <p className="font-medium text-slate-800 font-mono">
              {doc.tokensCount ? `${doc.tokensCount} tokens` : 'None'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400">Last Indexed</span>
            <p className="font-medium text-slate-800">{doc.indexedAt || 'Not indexed'}</p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="text-xs"
          >
            Remove
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedDocForDetails(null)}
            >
              Close
            </Button>
            {doc.status === 'Indexed' && (
              <Button
                variant="primary"
                size="sm"
                icon={MessageSquare}
                onClick={handleQueryInChat}
              >
                Query in Chat
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
