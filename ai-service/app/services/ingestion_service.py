from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import STORAGE_DIR
from app.services.pdf_extractor import extract_text_by_pages
from app.services.text_splitter import split_pages_into_chunks


def process_document(
    document_id: str,
    filename: Optional[str] = None,
    source: Optional[str] = None
) -> Dict[str, Any]:
    """
    Coordinates end-to-end ingestion processing for a document:
    1. Resolves and validates the physical PDF file path within STORAGE_DIR.
    2. Extracts page-aware text.
    3. Splits text into chunks with source metadata.
    4. Returns the structured ingestion result.
    """
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

    # Extract text by page
    pages = extract_text_by_pages(file_path)

    # Split into chunks
    chunks = split_pages_into_chunks(
        pages=pages,
        document_id=document_id,
        source_name=source_name
    )

    return {
        "document_id": document_id,
        "page_count": len(pages),
        "chunk_count": len(chunks),
        "chunks": chunks
    }
