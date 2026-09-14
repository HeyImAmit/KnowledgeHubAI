import express from "express";
import documentService from "../services/document.service.js";

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
 * Delete a document by UUID.
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

export default router;
