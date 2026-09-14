from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from app.services.ingestion_service import process_document

router = APIRouter()


class IngestionRequest(BaseModel):
    filename: Optional[str] = Field(None, description="Physical filename in the storage directory")
    source: Optional[str] = Field(None, description="Original human-readable filename or source name")


class ChunkMetadata(BaseModel):
    document_id: str
    page: int
    chunk_index: int
    source: str


class ChunkItem(BaseModel):
    text: str
    metadata: ChunkMetadata


class IngestionResponse(BaseModel):
    document_id: str
    page_count: int
    chunk_count: int
    chunks: List[ChunkItem]


@router.post(
    "/documents/{document_id}",
    response_model=IngestionResponse,
    status_code=status.HTTP_200_OK,
    summary="Process and chunk a stored document"
)
def ingest_document(document_id: str, payload: Optional[IngestionRequest] = None):
    """
    Ingest a stored PDF document by ID:
    - Extracts page-by-page text
    - Chunks text while preserving page-aware metadata
    - Returns structured chunk objects
    """
    if not document_id or not document_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid document_id is required."
        )

    filename = payload.filename if payload else None
    source = payload.source if payload else None

    try:
        result = process_document(
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
            detail=f"Document ingestion failed: {str(e)}"
        )
