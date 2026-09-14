import logging
from typing import List, Optional
from langchain_huggingface import HuggingFaceEmbeddings
from app.core.config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)


class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None
    _embeddings: Optional[HuggingFaceEmbeddings] = None
    _dimension: Optional[int] = None

    def __new__(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self) -> None:
        """Initializes the local HuggingFace embedding model once."""
        logger.info(f"Initializing embedding model '{EMBEDDING_MODEL}'...")
        self._embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        # Dynamically determine embedding dimension
        sample_vec = self._embeddings.embed_query("KnowledgeHub AI test dimension")
        self._dimension = len(sample_vec)
        logger.info(
            f"Embedding model '{EMBEDDING_MODEL}' initialized successfully. "
            f"Vector dimension: {self._dimension}"
        )

    @property
    def embeddings(self) -> HuggingFaceEmbeddings:
        if self._embeddings is None:
            self._initialize()
        return self._embeddings

    @property
    def dimension(self) -> int:
        if self._dimension is None:
            self._initialize()
        return self._dimension

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates dense vector embeddings for a list of document chunk texts."""
        if not texts:
            return []
        return self.embeddings.embed_documents(texts)

    def embed_query(self, text: str) -> List[float]:
        """Generates a dense vector embedding for a single search query."""
        if not text:
            return []
        return self.embeddings.embed_query(text)


# Shared global instance
embedding_service = EmbeddingService()


def get_embedding_service() -> EmbeddingService:
    return embedding_service
