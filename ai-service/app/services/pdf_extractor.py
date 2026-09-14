import re
from pathlib import Path
from typing import List, Dict, Any
from pypdf import PdfReader


def clean_page_text(text: str) -> str:
    """
    Perform conservative text normalization:
    - Normalizes horizontal whitespace (tabs and multiple spaces -> single space).
    - Removes trailing line whitespace.
    - Limits multiple consecutive blank lines to standard paragraph breaks.
    - Preserves technical punctuation, equations, code, and symbols.
    """
    if not text:
        return ""

    # Normalize horizontal whitespace per line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.splitlines()]

    # Reassemble and collapse 3+ consecutive newlines to double newline
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def extract_text_by_pages(file_path: Path) -> List[Dict[str, Any]]:
    """
    Extract text page-by-page from a PDF file.
    Returns a list of page objects preserving 1-indexed page numbers.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"PDF file not found at '{file_path}'")

    try:
        reader = PdfReader(str(file_path))
    except Exception as e:
        raise ValueError(f"Failed to parse PDF file '{file_path.name}': {str(e)}")

    pages: List[Dict[str, Any]] = []

    for idx, page in enumerate(reader.pages):
        page_number = idx + 1
        try:
            raw_text = page.extract_text() or ""
        except Exception:
            raw_text = ""

        cleaned_text = clean_page_text(raw_text)

        pages.append({
            "page": page_number,
            "text": cleaned_text,
            "char_count": len(cleaned_text),
        })

    return pages
