import logging
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import STORAGE_DIR
from app.services.pdf_extractor import extract_text_by_pages
from app.services.text_splitter import split_pages_into_chunks
from app.services.vector_store import get_vector_store_service

logger = logging.getLogger(__name__)


def process_and_index_document(
    document_id: str,
    filename: Optional[str] = None,
    source: Optional[str] = None
) -> Dict[str, Any]:
    """
    Coordinates end-to-end document indexing pipeline:
    1. Resolves and validates physical PDF file path in STORAGE_DIR.
    2. Extracts page-aware text from PDF.
    3. Splits pages into LangChain Document chunks.
    4. Generates embeddings and persists vectors in ChromaDB.
    5. Returns a compact indexing summary (does not return raw vector arrays).
    """
    if not document_id or not document_id.strip():
        raise ValueError("A valid document_id is required.")

    target_filename = filename if filename else f"{document_id}.pdf"

    # Secure path resolution within STORAGE_DIR
    resolved_storage = STORAGE_DIR.resolve()
    file_path = (resolved_storage / target_filename).resolve()

    # Prevent directory traversal attacks
    if not str(file_path).startswith(str(resolved_storage)):
        raise ValueError("Invalid filename: Path traversal is not permitted.")

    if not file_path.exists():
        raise FileNotFoundError(f"Stored document file not found at: {file_path.name}")

    source_name = source if source else target_filename

    # Step 1: Extract text by page
    pages = extract_text_by_pages(file_path)

    # Step 2: Split into chunks with source metadata
    chunks = split_pages_into_chunks(
        pages=pages,
        document_id=document_id,
        source_name=source_name
    )

    # Step 3: Embed and store vectors in ChromaDB
    vector_store = get_vector_store_service()
    index_result = vector_store.index_document(
        document_id=document_id,
        chunks=chunks
    )

    return {
        "document_id": document_id,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "indexed_count": index_result["indexed_count"],
        "embedding_dimension": index_result["embedding_dimension"],
        "collection_name": index_result["collection_name"],
    }
