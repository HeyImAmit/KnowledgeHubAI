import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.pdf_extractor import extract_text_by_pages
from app.services.text_splitter import split_pages_into_chunks

def main():
    pdf_path = Path(__file__).resolve().parent.parent.parent / "backend" / "scripts" / "sample_multipage.pdf"
    pages = extract_text_by_pages(pdf_path)
    print(f"Extracted Pages: {len(pages)}")
    for p in pages:
        print(f"  Page {p['page']}: char_count={p['char_count']}, preview={p['text'][:60]!r}")

    chunks = split_pages_into_chunks(pages, "doc-test-456", "sample_multipage.pdf")
    print(f"\nGenerated Chunks: {len(chunks)}")
    for idx, c in enumerate(chunks):
        print(f"  Chunk {idx}: metadata={c['metadata']} | text_len={len(c['text'])}")

if __name__ == "__main__":
    main()
