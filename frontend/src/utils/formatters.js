export function formatBytes(bytes, decimals = 1) {
  const num = Number(bytes);
  if (!num || isNaN(num) || num === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function normalizeDocument(doc) {
  if (!doc) return null;

  // Determine normalized status
  let status = 'Indexed';
  const rawStatus = (doc.status || '').toUpperCase();
  if (rawStatus === 'PROCESSING') status = 'Processing';
  else if (rawStatus === 'FAILED') status = 'Failed';
  else if (rawStatus === 'INDEXED') status = 'Indexed';

  return {
    id: doc.id,
    name: doc.original_name || doc.filename || 'Untitled Document.pdf',
    filename: doc.filename,
    original_name: doc.original_name,
    type: (doc.mime_type === 'application/pdf' ? 'PDF' : (doc.mime_type || 'PDF')).replace('application/', '').toUpperCase(),
    size: formatBytes(doc.file_size),
    file_size_raw: doc.file_size,
    pages: doc.page_count || 0,
    status,
    raw_status: doc.status,
    uploadedAt: formatRelativeTime(doc.created_at),
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    chunksCount: status === 'Indexed' ? Math.floor((doc.page_count || 1) * 3) : 0,
    author: doc.author || 'Technical Document',
    topics: doc.topics || (status === 'Indexed' ? ['Technical Reference'] : []),
    summary: doc.summary || `Stored in PostgreSQL repository. Indexed for technical document retrieval.`
  };
}
