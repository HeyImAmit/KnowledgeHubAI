import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  MessageSquare, 
  Plus, 
  X
} from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Button from '../common/Button';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { conversations, documents, setIsUploadModalOpen } = useKnowledge();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/documents',
      label: 'Documents',
      icon: Files,
      badge: documents.length
    },
    {
      to: '/chat',
      label: 'AI Chat',
      icon: MessageSquare,
      badge: null
    }
  ];

  const handleNewChat = () => {
    navigate('/chat');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#fbfcfd] border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shadow-xs tracking-tight">
              KH
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
                KnowledgeHub
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Enterprise RAG
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-3 border-b border-slate-100 space-y-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            className="w-full justify-start text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
            onClick={() => {
              setIsUploadModalOpen(true);
              if (onClose) onClose();
            }}
          >
            Upload Document
          </Button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-6">
          <div>
            <div className="px-2 mb-1.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Platform
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200/60 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Recent Inquiries */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Recent Inquiries
              </span>
              <button
                type="button"
                onClick={handleNewChat}
                className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="New Chat"
              >
                + New
              </button>
            </div>
            <div className="space-y-0.5">
              {conversations.slice(0, 4).map((conv) => (
                <NavLink
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="truncate pr-2">{conv.title}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 shrink-0 font-mono">
                    {conv.updatedAt}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info: Knowledge Base status */}
        <div className="p-3 border-t border-slate-200/70 bg-slate-50/50">
          <div className="rounded-md border border-slate-200 bg-white p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-800">Index Active</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {documents.filter((d) => d.status === 'Indexed').length}/{documents.length} Docs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {documents.filter((d) => d.status === 'Indexed').reduce((acc, curr) => acc + curr.pages, 0)} pages ready for semantic query
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
