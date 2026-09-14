import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

DEFAULT_STORAGE_DIR = (BASE_DIR.parent / "backend" / "storage" / "documents").resolve()

_env_storage = os.getenv("STORAGE_DIR")
if _env_storage:
    _storage_path = Path(_env_storage)
    STORAGE_DIR = (_storage_path if _storage_path.is_absolute() else (BASE_DIR / _storage_path)).resolve()
else:
    STORAGE_DIR = DEFAULT_STORAGE_DIR

# Chunking configuration
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))

# Embedding model configuration
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# ChromaDB vector store configuration
DEFAULT_CHROMA_DIR = (BASE_DIR / "storage" / "chroma").resolve()
_env_chroma = os.getenv("CHROMA_PERSIST_DIRECTORY")
if _env_chroma:
    _chroma_path = Path(_env_chroma)
    CHROMA_PERSIST_DIR = (_chroma_path if _chroma_path.is_absolute() else (BASE_DIR / _chroma_path)).resolve()
else:
    CHROMA_PERSIST_DIR = DEFAULT_CHROMA_DIR

CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "knowledgehub_documents")


