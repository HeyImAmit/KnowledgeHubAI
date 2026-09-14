import { useState } from 'react';
import { User, Copy, Check, BookOpen } from 'lucide-react';
import SourceCitation from './SourceCitation';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Helper to format text with simple markdown-like elements (bold, bullet points, headers)
  const renderFormattedContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-slate-900 mt-3 mb-1 uppercase tracking-wider">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Bullet list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-0.5">
            {renderBoldText(text)}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s+/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s+/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-slate-700 leading-relaxed my-0.5">
            {renderBoldText(text)}
          </li>
        );
      }
      // Empty line spacing
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="font-mono bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'} group`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs mt-0.5 font-medium select-none ${
          isUser
            ? 'bg-slate-900 text-white'
            : 'bg-white border border-slate-200 text-slate-700 shadow-2xs'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : 'KH'}
      </div>

      {/* Message Card */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-900">
            {isUser ? 'You' : 'KnowledgeHub Assistant'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {message.timestamp}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
            isUser
              ? 'bg-slate-900 text-slate-50 border-transparent shadow-xs'
              : 'bg-white text-slate-800 border-slate-200/90 shadow-2xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-xs text-slate-100 leading-relaxed font-normal">
              {message.content}
            </p>
          ) : (
            <div className="space-y-0.5">
              {renderFormattedContent(message.content)}
            </div>
          )}

          {/* Citations section if assistant response */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span>Grounding Sources & Citations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation) => (
                  <SourceCitation key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action bar below message */}
        <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
