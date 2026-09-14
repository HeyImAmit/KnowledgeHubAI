import os
import sys
import unittest
import tempfile
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.services.pdf_extractor import extract_text_by_pages, clean_page_text
from app.services.text_splitter import split_pages_into_chunks, get_text_splitter
from app.services.ingestion_service import process_document
from app.core import config


class TestIngestionPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.sample_pdf = Path(__file__).resolve().parent.parent.parent / "backend" / "scripts" / "sample_multipage.pdf"

    def test_clean_page_text(self):
        dirty = "  Operating    Systems \n\n\n\n  Concepts and Architecture.   \n  "
        cleaned = clean_page_text(dirty)
        self.assertEqual(cleaned, "Operating Systems\n\nConcepts and Architecture.")

    def test_text_splitter_chunking_and_metadata(self):
        pages = [
            {
                "page": 1,
                "text": "Introduction to Distributed Systems. " * 30,  # ~1100 characters
                "char_count": 1100,
            },
            {
                "page": 2,
                "text": "",  # Empty page
                "char_count": 0,
            },
            {
                "page": 3,
                "text": "Chapter 3: Consensus algorithms like Paxos and Raft provide fault-tolerance.",
                "char_count": 75,
            },
        ]

        document_id = "test-doc-123"
        source_name = "distributed_systems.pdf"

        chunks = split_pages_into_chunks(
            pages=pages,
            document_id=document_id,
            source_name=source_name,
        )

        # Ensure chunks were produced
        self.assertGreater(len(chunks), 1)

        # Verify metadata integrity across all chunks
        for idx, chunk in enumerate(chunks):
            self.assertIn("text", chunk)
            self.assertIn("metadata", chunk)
            meta = chunk["metadata"]
            self.assertEqual(meta["document_id"], document_id)
            self.assertEqual(meta["source"], source_name)
            self.assertEqual(meta["chunk_index"], idx)
            self.assertIn(meta["page"], [1, 3])  # Page 2 was empty and skipped

        # Verify page 3 chunk has page=3
        page_3_chunks = [c for c in chunks if c["metadata"]["page"] == 3]
        self.assertEqual(len(page_3_chunks), 1)
        self.assertIn("Consensus algorithms", page_3_chunks[0]["text"])

    def test_missing_document_raises_404(self):
        with self.assertRaises(FileNotFoundError):
            process_document(document_id="nonexistent-id-00000", filename="nonexistent.pdf")

    def test_path_traversal_rejection(self):
        with self.assertRaises(ValueError):
            process_document(document_id="test-traversal", filename="../../etc/passwd")

    def test_corrupt_pdf_handling(self):
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False, dir=config.STORAGE_DIR) as tmp:
            tmp.write(b"NOT_A_VALID_PDF_DATA_HERE")
            tmp_path = Path(tmp.name)

        try:
            with self.assertRaises(ValueError):
                extract_text_by_pages(tmp_path)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

    def test_live_multipage_pdf_extraction(self):
        if self.sample_pdf.exists():
            pages = extract_text_by_pages(self.sample_pdf)
            self.assertEqual(len(pages), 3)
            self.assertEqual(pages[0]["page"], 1)
            self.assertIn("Operating Systems", pages[0]["text"])
            self.assertEqual(pages[1]["text"], "")  # Blank page 2
            self.assertEqual(pages[2]["page"], 3)
            self.assertIn("Storage and File Systems", pages[2]["text"])

    def test_api_endpoint_missing_document_returns_404(self):
        response = self.client.post("/api/ingestion/documents/00000000-0000-0000-0000-000000000000")
        self.assertEqual(response.status_code, 404)

    def test_api_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")


if __name__ == "__main__":
    unittest.main()

