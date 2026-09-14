import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from app.core.config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME
from app.services.embedding_service import get_embedding_service

logger = logging.getLogger(__name__)


class VectorStoreService:
    _instance: Optional["VectorStoreService"] = None

    def __new__(cls) -> "VectorStoreService":
        if cls._instance is None:
            cls._instance = super(VectorStoreService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self) -> None:
        """Initializes the persistent ChromaDB client and ensures the collection exists."""
        CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"Connecting to ChromaDB persistent store at '{CHROMA_PERSIST_DIR}'...")
        
        self.client = chromadb.PersistentClient(
            path=str(CHROMA_PERSIST_DIR),
            settings=Settings(anonymized_telemetry=False)
        )
        
        self.collection = self.client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"description": "KnowledgeHub AI Document Chunks and Vector Embeddings"}
        )
        self.embedding_service = get_embedding_service()
        logger.info(
            f"ChromaDB collection '{CHROMA_COLLECTION_NAME}' ready. "
            f"Current total vector count: {self.collection.count()}"
        )

    def get_or_create_collection(self):
        """Returns the Chroma collection instance."""
        return self.collection

    def delete_document_vectors(self, document_id: str) -> int:
        """
        Deletes all vector chunks associated with a specific document_id.
        Returns the number of deleted records.
        """
        if not document_id:
            return 0

        # Query existing IDs for this document
        existing = self.collection.get(
            where={"document_id": document_id},
            include=["metadatas"]
        )
        existing_ids = existing.get("ids", [])
        if existing_ids:
            self.collection.delete(ids=existing_ids)
            logger.info(f"Deleted {len(existing_ids)} vectors for document '{document_id}' from ChromaDB.")
            return len(existing_ids)
        return 0

    def index_document(self, document_id: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Indexes a list of chunks into ChromaDB:
        1. Deletes existing vector records for this document_id (guarantees safe re-indexing & avoids stale chunks).
        2. Generates deterministic IDs: '{document_id}:{chunk_index}'.
        3. Generates dense vector embeddings using the singleton embedding service.
        4. Inserts records into the shared ChromaDB collection.
        5. Returns a compact indexing summary.
        """
        if not document_id or not document_id.strip():
            raise ValueError("A valid document_id is required for indexing.")

        # 1. Clear previous records for this document to handle re-indexing shrink edge cases
        self.delete_document_vectors(document_id)

        if not chunks:
            logger.info(f"No chunks provided to index for document '{document_id}'.")
            return {
                "document_id": document_id,
                "chunk_count": 0,
                "indexed_count": 0,
                "embedding_dimension": self.embedding_service.dimension,
                "collection_name": CHROMA_COLLECTION_NAME,
            }

        # 2. Prepare payload
        ids: List[str] = []
        texts: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for idx, chunk in enumerate(chunks):
            chunk_text = chunk.get("text", "")
            meta = chunk.get("metadata", {})
            chunk_index = meta.get("chunk_index", idx)

            deterministic_id = f"{document_id}:{chunk_index}"
            ids.append(deterministic_id)
            texts.append(chunk_text)
            metadatas.append({
                "document_id": document_id,
                "page": int(meta.get("page", 1)),
                "chunk_index": int(chunk_index),
                "source": str(meta.get("source", "")),
            })

        # 3. Generate embeddings
        logger.info(f"Generating embeddings for {len(texts)} chunks of document '{document_id}'...")
        embeddings = self.embedding_service.embed_documents(texts)

        # 4. Insert into ChromaDB collection
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )

        logger.info(
            f"Successfully indexed {len(ids)} chunks for document '{document_id}' into ChromaDB. "
            f"Total collection vectors: {self.collection.count()}"
        )

        # 5. Return compact summary
        return {
            "document_id": document_id,
            "chunk_count": len(chunks),
            "indexed_count": len(ids),
            "embedding_dimension": self.embedding_service.dimension,
            "collection_name": CHROMA_COLLECTION_NAME,
        }

    def count_vectors(self) -> int:
        """Returns total vectors stored across all documents in the collection."""
        return self.collection.count()

    def count_document_vectors(self, document_id: str) -> int:
        """Returns vector count for a specific document."""
        res = self.collection.get(where={"document_id": document_id})
        return len(res.get("ids", []))

    def similarity_search(
        self,
        query: str,
        k: int = 3,
        document_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes internal semantic similarity search for verification:
        1. Embeds search query.
        2. Queries ChromaDB collection for top-k closest vectors.
        3. Returns formatted chunk texts and metadata.
        """
        if not query or not query.strip():
            return []

        query_embedding = self.embedding_service.embed_query(query.strip())
        where_filter = {"document_id": document_id} if document_id else None

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )

        formatted_results: List[Dict[str, Any]] = []
        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        ids = results.get("ids", [[]])[0]

        for i in range(len(docs)):
            formatted_results.append({
                "id": ids[i] if i < len(ids) else None,
                "text": docs[i],
                "metadata": metas[i] if i < len(metas) else {},
                "distance": float(distances[i]) if i < len(distances) else None,
            })

        return formatted_results


# Shared global instance
vector_store_service = VectorStoreService()


def get_vector_store_service() -> VectorStoreService:
    return vector_store_service
