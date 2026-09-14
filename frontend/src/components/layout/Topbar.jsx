import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  Upload
} from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function Topbar({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsUploadModalOpen } = useKnowledge();

  const getPageDetails = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      return {
        title: 'Overview',
        subtitle: 'Knowledge base statistics & recent inquiries'
      };
    }
    if (path.startsWith('/documents')) {
      return {
        title: 'Document Index',
        subtitle: 'Technical manuals, whitepapers, and research documents'
      };
    }
    if (path.startsWith('/chat')) {
      return {
        title: 'Semantic Query & Chat',
        subtitle: 'Retrieval-Augmented Generation across indexed corpus'
      };
    }
    return {
      title: 'KnowledgeHub AI',
      subtitle: 'Technical Document Intelligence'
    };
  };

  const { title, subtitle } = getPageDetails();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              {title}
            </h2>
            <Badge variant="neutral" size="sm" className="hidden sm:inline-flex text-[10px] py-0 px-1.5">
              Phase 1
            </Badge>
          </div>
          <span className="hidden md:inline-block text-[11px] text-slate-500 font-normal leading-none mt-0.5">
            {subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Local Engine Ready</span>
        </div>

        {location.pathname.startsWith('/chat') ? (
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/chat')}
            className="text-xs"
          >
            New Inquiry
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => setIsUploadModalOpen(true)}
            className="text-xs"
          >
            Upload Document
          </Button>
        )}
      </div>
    </header>
  );
}
