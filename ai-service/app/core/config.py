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

