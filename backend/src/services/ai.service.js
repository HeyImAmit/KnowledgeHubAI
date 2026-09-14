import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  timeout: 30000,
});

export async function checkAIService() {
  const response = await aiClient.get("/api/health");
  return response.data;
}

/**
 * Triggers PDF text extraction and chunking in the FastAPI service.
 * @param {string} documentId - Document UUID
 * @param {object} options - Filename and original source name
 * @returns {Promise<{document_id: string, page_count: number, chunk_count: number, chunks: Array}>}
 */
export async function ingestDocument(documentId, { filename, source } = {}) {
  const response = await aiClient.post(`/api/ingestion/documents/${documentId}`, {
    filename,
    source,
  });
  return response.data;
}

export default {
  checkAIService,
  ingestDocument,
};