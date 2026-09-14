import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  MessageSquare, 
  Upload, 
  CheckCircle2, 
  ArrowUpRight, 
  Plus,
  BookOpen
} from 'lucide-react';
import { useKnowledge } from '../context/useKnowledge';
import Button from '../components/common/Button';
import DocumentStatus from '../components/documents/DocumentStatus';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    documents, 
    conversations, 
    overviewMetrics, 
    setIsUploadModalOpen,
    setSelectedDocForDetails 
  } = useKnowledge();

  const recentDocs = documents.slice(0, 4);
  const recentInquiries = conversations.slice(0, 3);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Technical Knowledge Base
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Centralized document corpus with deterministic semantic chunking and citation-grounded retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={MessageSquare}
            onClick={() => navigate('/chat')}
            className="text-xs"
          >
            Start Inquiry
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Documents Ingested</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {overviewMetrics.totalDocuments}
            </span>
            <span className="text-xs text-slate-500 font-sans">
              ({overviewMetrics.indexedDocuments} indexed)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Ready for semantic retrieval</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Indexed Pages</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {overviewMetrics.totalIndexedPages}
            </span>
            <span className="text-xs text-slate-500 font-sans">pages</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Across {overviewMetrics.indexedDocuments} textbooks & papers
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Knowledge Chunks</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {overviewMetrics.totalKnowledgeChunks}
            </span>
            <span className="text-xs text-slate-500 font-sans">vectors</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Indexed with dense embeddings
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pipeline Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-slate-900">
              {overviewMetrics.systemStatus}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Last indexed {overviewMetrics.lastIndexedTime}
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recently Added Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Recently Added Documents
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowUpRight}
              iconPosition="right"
              onClick={() => navigate('/documents')}
              className="text-xs text-slate-600"
            >
              View All ({documents.length})
            </Button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocForDetails(doc)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {doc.author || 'Technical Resource'} · {doc.pages} pages · {doc.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <DocumentStatus status={doc.status} size="sm" />
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                      {doc.uploadedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Conversations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Recent Inquiries
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/chat')}
              className="text-xs text-slate-600"
            >
              New
            </Button>
          </div>

          <div className="space-y-3">
            {recentInquiries.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {conv.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {conv.updatedAt}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {conv.lastMessage}
                </p>

                {conv.referencedDocs && conv.referencedDocs.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{conv.referencedDocs[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
