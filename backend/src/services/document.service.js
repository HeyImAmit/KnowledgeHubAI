import fs from "fs";
import path from "path";
import documentModel from "../models/document.model.js";
import aiService from "./ai.service.js";
import { STORAGE_DIR } from "../middleware/upload.middleware.js";

const VALID_STATUSES = ["PROCESSING", "INDEXED", "FAILED"];

export async function fetchAllDocuments() {
  return await documentModel.getAllDocuments();
}

export async function fetchDocumentById(id) {
  return await documentModel.getDocumentById(id);
}

/**
 * Executes document ingestion (PDF extraction & chunking) via FastAPI AI service.
 */
export async function processDocumentIngestion(id) {
  const document = await documentModel.getDocumentById(id);
  if (!document) {
    const error = new Error(`Document with ID '${id}' not found`);
    error.code = "DOCUMENT_NOT_FOUND";
    throw error;
  }

  try {
    const ingestionResult = await aiService.ingestDocument(id, {
      filename: document.filename,
      source: document.original_name,
    });

    // Update document page count from extracted PDF pages
    const updatedDocument = await documentModel.updateDocumentIngestion(id, {
      page_count: ingestionResult.page_count,
      status: "PROCESSING", // Retains PROCESSING status until vector embeddings in Phase 5
    });

    return {
      document: updatedDocument,
      ingestion: ingestionResult,
    };
  } catch (error) {
    console.error(`Ingestion processing error for document ${id}:`, error.message);
    // Transition status to FAILED upon processing failure
    await documentModel.updateDocumentStatus(id, "FAILED").catch((err) => {
      console.error(`Failed to update status to FAILED for document ${id}:`, err.message);
    });
    throw error;
  }
}

/**
 * Handle transactional document upload & database registration,
 * and immediately trigger ingestion pipeline.
 */
export async function uploadAndRegisterDocument({ file }) {
  if (!file) {
    throw new Error("NO_FILE_PROVIDED");
  }

  let createdDoc = null;
  try {
    createdDoc = await documentModel.createDocument({
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype || "application/pdf",
      file_size: file.size || 0,
      page_count: 0,
      status: "PROCESSING",
    });

    // Run ingestion to extract pages and prepare chunks
    try {
      const { document: ingestedDoc } = await processDocumentIngestion(createdDoc.id);
      return ingestedDoc || createdDoc;
    } catch (ingestionError) {
      console.warn(
        `Document ${createdDoc.id} uploaded but ingestion encountered an error:`,
        ingestionError.message
      );
      // Return the document (which has status FAILED from processDocumentIngestion)
      return (await documentModel.getDocumentById(createdDoc.id)) || createdDoc;
    }
  } catch (error) {
    // Clean up physical file on database failure before creation
    if (!createdDoc && file.path && fs.existsSync(file.path)) {
      try {
        await fs.promises.unlink(file.path);
        console.log(`Cleaned up orphaned file '${file.path}' after database failure.`);
      } catch (cleanupError) {
        console.error(`Failed to delete orphaned file '${file.path}':`, cleanupError);
      }
    }
    throw error;
  }
}

export async function registerDocument({
  filename,
  original_name,
  mime_type = "application/pdf",
  file_size = 0,
  page_count = 0,
  status = "PROCESSING",
}) {
  const normalizedStatus = status.toUpperCase();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error(`Invalid document status '${status}'. Allowed values: ${VALID_STATUSES.join(", ")}`);
  }

  return await documentModel.createDocument({
    filename,
    original_name: original_name || filename,
    mime_type,
    file_size: Number(file_size) || 0,
    page_count: Number(page_count) || 0,
    status: normalizedStatus,
  });
}

export async function updateStatus(id, status) {
  const normalizedStatus = status.toUpperCase();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    throw new Error(`Invalid document status '${status}'. Allowed values: ${VALID_STATUSES.join(", ")}`);
  }

  return await documentModel.updateDocumentStatus(id, normalizedStatus);
}

/**
 * Remove document metadata and clean up associated physical file if present.
 */
export async function removeDocument(id) {
  const existing = await documentModel.getDocumentById(id);
  if (!existing) {
    return null;
  }

  const deleted = await documentModel.deleteDocument(id);

  // Clean up physical file if it exists in local storage
  if (existing.filename) {
    const physicalPath = path.join(STORAGE_DIR, existing.filename);
    if (fs.existsSync(physicalPath)) {
      try {
        await fs.promises.unlink(physicalPath);
        console.log(`Deleted physical file '${physicalPath}' for document ID ${id}.`);
      } catch (err) {
        console.error(`Error deleting physical file '${physicalPath}':`, err);
      }
    }
  }

  return deleted;
}

export default {
  fetchAllDocuments,
  fetchDocumentById,
  processDocumentIngestion,
  uploadAndRegisterDocument,
  registerDocument,
  updateStatus,
  removeDocument,
};
