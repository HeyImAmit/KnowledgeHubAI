from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import CHUNK_SIZE, CHUNK_OVERLAP


def get_text_splitter(
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None
) -> RecursiveCharacterTextSplitter:
    """
    Initializes a LangChain RecursiveCharacterTextSplitter with configurable
    chunk size and overlap.
    """
    size = chunk_size if chunk_size is not None else CHUNK_SIZE
    overlap = chunk_overlap if chunk_overlap is not None else CHUNK_OVERLAP

    return RecursiveCharacterTextSplitter(
        chunk_size=size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", " ", ""]
    )


def split_pages_into_chunks(
    pages: List[Dict[str, Any]],
    document_id: str,
    source_name: str,
    splitter: Optional[RecursiveCharacterTextSplitter] = None
) -> List[Dict[str, Any]]:
    """
    Splits page-aware text entries into LangChain Document chunks while preserving
    strict source metadata (document_id, page, chunk_index, source).
    """
    if splitter is None:
        splitter = get_text_splitter()

    chunks: List[Dict[str, Any]] = []
    chunk_index = 0

    for page_data in pages:
        page_num = page_data["page"]
        text = page_data.get("text", "")

        # Skip completely empty pages from generating phantom chunks
        if not text.strip():
            continue

        # Create LangChain Document for the page
        page_doc = Document(
            page_content=text,
            metadata={
                "document_id": document_id,
                "page": page_num,
                "source": source_name,
            }
        )

        # Split document using LangChain RecursiveCharacterTextSplitter
        split_docs = splitter.split_documents([page_doc])

        for doc in split_docs:
            chunk_text = doc.page_content.strip()
            if not chunk_text:
                continue

            chunks.append({
                "text": chunk_text,
                "metadata": {
                    "document_id": document_id,
                    "page": page_num,
                    "chunk_index": chunk_index,
                    "source": source_name,
                }
            })
            chunk_index += 1

    return chunks
