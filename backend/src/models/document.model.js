import { query } from "../config/database.js";

/**
 * Retrieve all documents ordered by creation time descending.
 */
export async function getAllDocuments() {
  const sql = `
    SELECT 
      id,
      filename,
      original_name,
      mime_type,
      file_size,
      page_count,
      status,
      created_at,
      updated_at
    FROM documents
    ORDER BY created_at DESC;
  `;
  const res = await query(sql);
  return res.rows;
}

/**
 * Retrieve a single document by UUID.
 */
export async function getDocumentById(id) {
  const sql = `
    SELECT 
      id,
      filename,
      original_name,
      mime_type,
      file_size,
      page_count,
      status,
      created_at,
      updated_at
    FROM documents
    WHERE id = $1;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

/**
 * Insert a new document metadata record.
 */
export async function createDocument({
  filename,
  original_name,
  mime_type = "application/pdf",
  file_size = 0,
  page_count = 0,
  status = "PROCESSING",
}) {
  const sql = `
    INSERT INTO documents (
      filename,
      original_name,
      mime_type,
      file_size,
      page_count,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING 
      id,
      filename,
      original_name,
      mime_type,
      file_size,
      page_count,
      status,
      created_at,
      updated_at;
  `;
  const res = await query(sql, [
    filename,
    original_name,
    mime_type,
    file_size,
    page_count,
    status,
  ]);
  return res.rows[0];
}

/**
 * Update the status of a document.
 */
export async function updateDocumentStatus(id, status) {
  const sql = `
    UPDATE documents
    SET 
      status = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING 
      id,
      filename,
      original_name,
      mime_type,
      file_size,
      page_count,
      status,
      created_at,
      updated_at;
  `;
  const res = await query(sql, [id, status]);
  return res.rows[0] || null;
}

/**
 * Delete a document by UUID.
 */
export async function deleteDocument(id) {
  const sql = `
    DELETE FROM documents
    WHERE id = $1
    RETURNING id;
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

export default {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocumentStatus,
  deleteDocument,
};
