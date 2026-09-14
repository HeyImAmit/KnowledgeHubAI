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

/**
 * Triggers full vector indexing (extraction, chunking, embeddings, ChromaDB) in FastAPI.
 * @param {string} documentId - Document UUID
 * @param {object} options - Filename and original source name
 * @returns {Promise<{document_id: string, page_count: number, chunk_count: number, indexed_count: number, embedding_dimension: number, collection_name: string}>}
 */
export async function indexDocument(documentId, { filename, source } = {}) {
  const response = await aiClient.post(`/api/indexing/documents/${documentId}`, {
    filename,
    source,
  });
  return response.data;
}

/**
 * Deletes all vector chunks associated with a document from ChromaDB.
 * @param {string} documentId - Document UUID
 */
export async function deleteDocumentVectors(documentId) {
  const response = await aiClient.delete(`/api/indexing/documents/${documentId}`);
  return response.data;
}

/**
 * Runs semantic similarity search on ChromaDB vectors.
 */
export async function searchVectors({ query, k = 3, documentId = null } = {}) {
  const response = await aiClient.post("/api/indexing/search", {
    query,
    k,
    document_id: documentId,
  });
  return response.data;
}

export default {
  checkAIService,
  ingestDocument,
  indexDocument,
  deleteDocumentVectors,
  searchVectors,
};