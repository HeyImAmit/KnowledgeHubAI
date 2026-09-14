import { useState, useRef } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { useKnowledge } from '../../context/useKnowledge';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function UploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen, uploadDocument, refreshDocuments } = useKnowledge();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetState();
      setIsUploadModalOpen(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      setError('Only PDF documents (.pdf) are supported.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the maximum limit of 50MB.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF document to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError('');

    try {
      await uploadDocument(selectedFile, (percent) => {
        setUploadProgress(Math.max(15, percent));
      });

      setUploadProgress(100);
      
      // Refresh documents list
      if (refreshDocuments) {
        await refreshDocuments();
      }

      setTimeout(() => {
        setIsUploading(false);
        setIsUploadModalOpen(false);
        resetState();
      }, 400);
    } catch (err) {
      console.error('Upload failed:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setError(serverMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={handleClose}
      title="Upload Technical Document"
      subtitle="Upload a PDF textbook, manual, or research paper for ingestion"
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
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (!isUploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isUploading
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-75'
              : selectedFile
                ? 'border-slate-400 bg-slate-50/70 cursor-pointer'
                : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            disabled={isUploading}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 break-all">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload
                </p>
                {!isUploading && (
                  <span className="inline-block text-[11px] text-indigo-600 font-medium hover:underline pt-1">
                    Click to choose a different file
                  </span>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-700">
                  <span className="text-slate-900 font-semibold underline underline-offset-2">Click to browse</span> or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF documents up to 50MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                <span>Uploading and registering in PostgreSQL...</span>
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

        {/* Ingestion Info */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Ingestion Pipeline:</span> The uploaded PDF is saved to disk and registered in PostgreSQL with <code className="font-mono text-slate-700 bg-white px-1 py-0.5 rounded border border-slate-200">PROCESSING</code> status. Text extraction and embedding will occur in subsequent phases.
        </div>

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
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
