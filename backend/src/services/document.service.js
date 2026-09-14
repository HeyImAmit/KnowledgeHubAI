import documentModel from "../models/document.model.js";

const VALID_STATUSES = ["PROCESSING", "INDEXED", "FAILED"];

export async function fetchAllDocuments() {
  return await documentModel.getAllDocuments();
}

export async function fetchDocumentById(id) {
  return await documentModel.getDocumentById(id);
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

export async function removeDocument(id) {
  return await documentModel.deleteDocument(id);
}

export default {
  fetchAllDocuments,
  fetchDocumentById,
  registerDocument,
  updateStatus,
  removeDocument,
};
