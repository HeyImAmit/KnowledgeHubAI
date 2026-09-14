import express from "express";
import documentService from "../services/document.service.js";
import uploadSinglePdf from "../middleware/upload.middleware.js";

const router = express.Router();

// Simple UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/documents
 * Retrieve list of all documents.
 */
router.get("/", async (req, res) => {
  try {
    const documents = await documentService.fetchAllDocuments();
    return res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      error: "Failed to retrieve documents",
      message: error.message,
    });
  }
});

/**
 * GET /api/documents/:id
 * Retrieve a single document by UUID.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({
      error: "Invalid document ID format",
      message: "Document ID must be a valid UUID",
    });
  }

  try {
    const document = await documentService.fetchDocumentById(id);
    if (!document) {
      return res.status(404).json({
        error: "Document not found",
        message: `No document found with ID '${id}'`,
      });
    }

    return res.status(200).json({ document });
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    return res.status(500).json({
      error: "Failed to retrieve document",
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/upload
 * Real PDF upload endpoint via multipart/form-data.
 */
router.post("/upload", uploadSinglePdf, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Missing file",
      message: "Please select a PDF document to upload with field name 'file'",
    });
  }

  try {
    const document = await documentService.uploadAndRegisterDocument({
      file: req.file,
    });

    return res.status(201).json({ document });
  } catch (error) {
    console.error("Error during document upload:", error);
    return res.status(500).json({
      error: "Upload failed",
      message: error.message || "Failed to process and register document",
    });
  }
});

/**
 * POST /api/documents
 * Register a new document metadata record (Development / Test ingestion).
 */
router.post("/", async (req, res) => {
  const { filename, original_name, mime_type, file_size, page_count, status } = req.body;

  if (!filename && !original_name) {
    return res.status(400).json({
      error: "Validation error",
      message: "Either 'filename' or 'original_name' is required",
    });
  }

  try {
    const document = await documentService.registerDocument({
      filename: filename || original_name,
      original_name: original_name || filename,
      mime_type,
      file_size,
      page_count,
      status,
    });

    return res.status(201).json({ document });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(400).json({
      error: "Failed to create document",
      message: error.message,
    });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document by UUID (removes metadata and physical file).
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({
      error: "Invalid document ID format",
      message: "Document ID must be a valid UUID",
    });
  }

  try {
    const deleted = await documentService.removeDocument(id);
    if (!deleted) {
      return res.status(404).json({
        error: "Document not found",
        message: `No document found with ID '${id}' to delete`,
      });
    }

    return res.status(200).json({
      message: "Document deleted successfully",
      id,
    });
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return res.status(500).json({
      error: "Failed to delete document",
      message: error.message,
    });
  }
});

/**
 * POST /api/documents/:id/ingest
 * Trigger ingestion pipeline (PDF extraction & chunking) for a stored document.
 */
router.post("/:id/ingest", async (req, res) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({
      error: "Invalid document ID format",
      message: "Document ID must be a valid UUID",
    });
  }

  try {
    const result = await documentService.processDocumentIngestion(id);
    return res.status(200).json({
      message: "Document ingestion completed successfully",
      document: result.document,
      ingestion: result.ingestion,
    });
  } catch (error) {
    console.error(`Error ingesting document ${id}:`, error.message);
    if (error.code === "DOCUMENT_NOT_FOUND" || error.message?.includes("not found")) {
      return res.status(404).json({
        error: "Document not found",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Ingestion failed",
      message: error.message || "Failed to process document",
    });
  }
});

/**
 * POST /api/documents/:id/index
 * Trigger full vector indexing pipeline (PDF extraction, chunking, embeddings, ChromaDB) for a stored document.
 */
router.post("/:id/index", async (req, res) => {

  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({
      error: "Invalid document ID format",
      message: "Document ID must be a valid UUID",
    });
  }

  try {
    const result = await documentService.reindexDocument(id);
    return res.status(200).json({
      message: "Document indexing completed successfully",
      document: result.document,
      indexing: result.indexing,
    });
  } catch (error) {
    console.error(`Error indexing document ${id}:`, error.message);
    if (error.code === "DOCUMENT_NOT_FOUND" || error.message?.includes("not found")) {
      return res.status(404).json({
        error: "Document not found",
        message: error.message,
      });
    }

    return res.status(500).json({
      error: "Indexing failed",
      message: error.message || "Failed to index document vectors",
    });
  }
});

export default router;


