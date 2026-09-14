import { useState } from 'react';
import { 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  Upload, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { useKnowledge } from '../context/useKnowledge';
import DocumentList from '../components/documents/DocumentList';
import DocumentCard from '../components/documents/DocumentCard';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function DocumentsPage() {
  const { documents, setIsUploadModalOpen } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const counts = {
    All: documents.length,
    Indexed: documents.filter((d) => d.status === 'Indexed').length,
    Processing: documents.filter((d) => d.status === 'Processing').length,
    Failed: documents.filter((d) => d.status === 'Failed').length,
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.author && doc.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.topics && doc.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage textbooks, architecture specifications, and technical reference papers indexed for RAG queries.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Upload}
          onClick={() => setIsUploadModalOpen(true)}
          className="text-xs self-start sm:self-auto"
        >
          Upload Document
        </Button>
      </div>

      {/* Search, Filter Tabs & View Mode Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
          {['All', 'Indexed', 'Processing', 'Failed'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/60 text-slate-500'
              }`}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar & View Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, author, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description={
            searchTerm
              ? `No documents match "${searchTerm}". Try a different keyword or reset filters.`
              : 'There are no documents in this status category.'
          }
          actionLabel={searchTerm ? 'Clear Search' : 'Upload Document'}
          onAction={searchTerm ? () => setSearchTerm('') : () => setIsUploadModalOpen(true)}
          actionIcon={searchTerm ? RefreshCw : Plus}
        />
      ) : viewMode === 'table' ? (
        <DocumentList documents={filteredDocs} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
