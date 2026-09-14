import { useEffect, useRef, useState } from 'react';
import { 
  BookOpen, 
  MessageSquare
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Badge from '../common/Badge';
import { useKnowledge } from '../../context/useKnowledge';

export default function ChatWindow({ conversation, conversationId }) {
  const { documents, sendMessage } = useKnowledge();
  const [selectedDocFilter, setSelectedDocFilter] = useState('All Indexed Documents');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const indexedDocs = documents.filter((d) => d.status === 'Indexed');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const handleSend = (text) => {
    setIsSending(true);
    sendMessage(conversationId, text);
    setTimeout(() => {
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fbfcfd] min-w-0">
      {/* Chat Header */}
      <div className="h-14 px-6 border-b border-slate-200/80 bg-white/80 backdrop-blur-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-slate-900 truncate">
              {conversation ? conversation.title : 'New Technical Inquiry'}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>RAG Mode: Strict Citations</span>
              {conversation?.referencedDocs && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 truncate max-w-[200px]">
                    {conversation.referencedDocs.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {conversation && conversation.messages && (
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm" className="hidden sm:inline-flex text-[10px] font-mono">
              {conversation.messages.length} messages
            </Badge>
          </div>
        )}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Ask KnowledgeHub AI
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-md">
              Ask technical questions across your {indexedDocs.length} indexed textbooks, specifications, and architecture manuals. Every answer is grounded with direct page citations.
            </p>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleSend("What are Coffman's four conditions for deadlock in an OS?")}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 transition-colors shadow-2xs group text-left cursor-pointer"
              >
                <span className="font-semibold block mb-0.5 text-slate-900">Operating Systems</span>
                <span className="text-slate-500 text-[11px] line-clamp-2">Explain Coffman's conditions for deadlock and prevention strategies.</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend("What is the difference between 3NF and BCNF normalization?")}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-slate-900 transition-colors shadow-2xs group text-left cursor-pointer"
              >
                <span className="font-semibold block mb-0.5 text-slate-900">Database Internals</span>
                <span className="text-slate-500 text-[11px] line-clamp-2">Contrast 3NF with BCNF dependency preservation trade-offs.</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 sm:p-6 bg-white border-t border-slate-200/80 shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSend}
            isLoading={isSending}
            selectedDocFilter={selectedDocFilter}
            onSelectDocFilter={setSelectedDocFilter}
            availableDocs={indexedDocs}
          />
        </div>
      </div>
    </div>
  );
}
