import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  BookOpen
} from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Button from '../common/Button';

export default function ConversationHistory({ activeConversationId }) {
  const navigate = useNavigate();
  const { conversations } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-72 lg:w-80 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-semibold text-slate-900">Inquiries</h3>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/chat')}
          className="text-xs py-1 px-2.5"
        >
          New
        </Button>
      </div>

      {/* Search Conversations */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No inquiries match your filter.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <NavLink
                key={conv.id}
                to={`/chat/${conv.id}`}
                className={`block p-3 rounded-lg text-xs transition-all border ${
                  isActive
                    ? 'bg-slate-100/90 border-slate-300 text-slate-900 shadow-2xs font-medium'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-900 line-clamp-1">
                    {conv.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {conv.updatedAt}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {conv.lastMessage}
                </p>

                {conv.referencedDocs && conv.referencedDocs.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-mono">
                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{conv.referencedDocs[0]}</span>
                  </div>
                )}
              </NavLink>
            );
          })
        )}
      </div>
    </div>
  );
}
