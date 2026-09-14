import { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, X, Loader2 } from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function UploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen, addDocument } = useKnowledge();
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [author, setAuthor] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(['Operating Systems', 'Kernel']);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setDocName('');
    setAuthor('');
    setTopicInput('');
    setTopics(['Technical Reference']);
    setIsUploading(false);
    setUploadProgress(0);
    setError('');
  };

  const handleClose = () => {
    if (!isUploading) {
      resetState();
      setIsUploadModalOpen(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.md')) {
      setError('Please select a valid PDF, Markdown, or TXT document.');
      return;
    }
    setError('');
    setSelectedFile(file);
    setDocName(file.name);
  };

  const handleAddTopic = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && topicInput.trim()) {
      e.preventDefault();
      const clean = topicInput.trim().replace(/^,|,$/g, '');
      if (clean && !topics.includes(clean)) {
        setTopics([...topics, clean]);
      }
      setTopicInput('');
    }
  };

  const removeTopic = (indexToRemove) => {
    setTopics(topics.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile && !docName) {
      setError('Please select a file to index.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const timer1 = setTimeout(() => setUploadProgress(45), 400);
    const timer2 = setTimeout(() => setUploadProgress(80), 800);
    const timer3 = setTimeout(() => {
      setUploadProgress(100);
      
      const fileSizeRaw = selectedFile ? selectedFile.size : 4800000;
      
      addDocument({
        name: docName.trim() || (selectedFile ? selectedFile.name : 'Untitled Document.pdf'),
        file_size_raw: fileSizeRaw,
        pages: Math.floor(Math.random() * 120) + 30,
        author: author.trim() || 'Technical Author',
        topics: topics.length > 0 ? topics : ['Reference'],
        summary: `Document ingested for semantic chunk retrieval. Extracted initial topics: ${topics.join(', ')}.`
      });

      setTimeout(() => {
        setIsUploading(false);
        setIsUploadModalOpen(false);
        resetState();
      }, 400);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={handleClose}
      title="Upload & Ingest Document"
      subtitle="Upload technical PDFs to extract, chunk, and index for semantic retrieval"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            selectedFile
              ? 'border-slate-400 bg-slate-50/70'
              : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 break-all">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to parse
                </p>
                <span className="inline-block text-[11px] text-indigo-600 font-medium hover:underline pt-1">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-700">
                  <span className="text-slate-900 font-semibold underline underline-offset-2">Click to browse</span> or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports technical PDFs, Markdown, TXT up to 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Document Title & Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Document Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems.pdf"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Author / Publisher (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Silberschatz et al."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Topic tags */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Semantic Topics & Tags
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-md min-h-[38px] items-center">
            {topics.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTopic(idx)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={topics.length === 0 ? "Type topic and press Enter..." : "Add topic..."}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleAddTopic}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-800 flex-1 min-w-[100px]"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Press Enter or comma to add keyword tags
          </span>
        </div>

        {/* Ingestion Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                <span>Extracting text & generating vector embeddings...</span>
              </span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isUploading}
            disabled={(!selectedFile && !docName) || isUploading}
          >
            {isUploading ? 'Ingesting...' : 'Start Ingestion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
