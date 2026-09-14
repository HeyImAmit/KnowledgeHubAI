import { useState, useRef } from 'react';
import { Send, Filter } from 'lucide-react';
import Button from '../common/Button';

export default function ChatInput({ 
  onSendMessage, 
  isLoading = false,
  selectedDocFilter = 'All Indexed Documents',
  onSelectDocFilter,
  availableDocs = []
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const suggestedPrompts = [
    "Explain Coffman's conditions for deadlock prevention",
    "Compare 3NF vs BCNF normalization with examples",
    "How does TCP Cubic handle congestion window scaling?"
  ];

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="space-y-2">
      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
          Suggestions:
        </span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInput(prompt)}
            className="text-left text-[11px] px-2.5 py-1 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 whitespace-nowrap transition-colors border border-slate-200/60 shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="bg-white border border-slate-200/90 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 rounded-xl p-2.5 shadow-xs transition-all">
        {/* Top bar with filter */}
        <div className="flex items-center justify-between pb-1.5 px-1 border-b border-slate-100 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>Scope:</span>
            <select
              value={selectedDocFilter}
              onChange={(e) => onSelectDocFilter && onSelectDocFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="All Indexed Documents">All Indexed Documents ({availableDocs.length})</option>
              {availableDocs.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
            Shift+Enter for newline
          </span>
        </div>

        {/* Textarea */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question across your indexed technical documents..."
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none px-1 py-1 leading-relaxed max-h-40 min-h-[44px]"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            icon={Send}
            className="h-8 px-3 shrink-0"
          >
            Ask
          </Button>
        </div>
      </div>
    </div>
  );
}
