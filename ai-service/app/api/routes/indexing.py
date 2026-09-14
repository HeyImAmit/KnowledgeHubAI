from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.indexing_service import process_and_index_document
from app.services.vector_store import get_vector_store_service

router = APIRouter()


class IndexingRequest(BaseModel):
    filename: Optional[str] = Field(None, description="Physical filename in the storage directory")
    source: Optional[str] = Field(None, description="Original human-readable filename or source name")


class IndexingResponse(BaseModel):
    document_id: str
    page_count: int
    chunk_count: int
    indexed_count: int
    embedding_dimension: int
    collection_name: str


class SearchRequest(BaseModel):
    query: str = Field(..., description="Query text to search semantically in vector store")
    k: int = Field(3, ge=1, le=50, description="Top-k similar chunks to retrieve")
    document_id: Optional[str] = Field(None, description="Optional document ID to restrict search scope")


class SearchResultItem(BaseModel):
    id: Optional[str]
    text: str
    metadata: Dict[str, Any]
    distance: Optional[float]


class SearchResponse(BaseModel):
    query: str
    count: int
    results: List[SearchResultItem]


@router.post(
    "/documents/{document_id}",
    response_model=IndexingResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract, chunk, embed, and index a document into ChromaDB"
)
def index_document(document_id: str, payload: Optional[IndexingRequest] = None):
    """
    Triggers end-to-end vector indexing for a document:
    - Extracts PDF page text
    - Splits into LangChain chunks
    - Generates dense vector embeddings (all-MiniLM-L6-v2)
    - Persists vectors and metadata into persistent ChromaDB
    - Returns compact indexing summary
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid document_id is required."
        )

    filename = payload.filename if payload else None
    source = payload.source if payload else None

    try:
        result = process_and_index_document(
            document_id=document_id.strip(),
            filename=filename,
            source=source
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document indexing failed: {str(e)}"
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Internal semantic similarity search for verification"
)
def search_vectors(request: SearchRequest):
    """
    Runs semantic similarity search on ChromaDB vectors.
    Used for Phase 5 verification and inspection.
    """
    vector_store = get_vector_store_service()
    results = vector_store.similarity_search(
        query=request.query,
        k=request.k,
        document_id=request.document_id
    )

    return {
        "query": request.query,
        "count": len(results),
        "results": results
    }


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete all vector chunks for a document from ChromaDB"
)
def delete_document_vectors(document_id: str):
    """Removes all indexed vector records associated with a document_id."""
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid document_id is required."
        )

    vector_store = get_vector_store_service()
    deleted_count = vector_store.delete_document_vectors(document_id.strip())
    return {
        "message": "Document vectors deleted successfully",
        "document_id": document_id,
        "deleted_count": deleted_count
    }


@router.get(
    "/stats",
    status_code=status.HTTP_200_OK,
    summary="Retrieve ChromaDB collection statistics"
)
def get_indexing_stats():
    """Returns vector count and embedding metadata for the active collection."""
    vector_store = get_vector_store_service()
    return {
        "collection_name": vector_store.collection.name,
        "total_vectors": vector_store.count_vectors(),
        "embedding_dimension": vector_store.embedding_service.dimension,
    }
