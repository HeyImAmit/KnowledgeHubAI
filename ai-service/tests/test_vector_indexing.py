import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.services.embedding_service import get_embedding_service
from app.services.vector_store import VectorStoreService, get_vector_store_service
from app.services.indexing_service import process_and_index_document
from app.core import config


class TestVectorIndexingPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.sample_pdf = Path(__file__).resolve().parent.parent.parent / "backend" / "scripts" / "sample_multipage.pdf"
        cls.embedding_service = get_embedding_service()
        cls.vector_store = get_vector_store_service()

    def test_embedding_service_initialization_and_dimension(self):
        """Verify the embedding model loads and reports accurate dimension (384 for all-MiniLM-L6-v2)."""
        dim = self.embedding_service.dimension
        self.assertEqual(dim, 384)

        sample_vec = self.embedding_service.embed_query("Process scheduling and virtual memory")
        self.assertEqual(len(sample_vec), 384)
        self.assertIsInstance(sample_vec[0], float)

        batch_vecs = self.embedding_service.embed_documents(["Page one text", "Page two text"])
        self.assertEqual(len(batch_vecs), 2)
        self.assertEqual(len(batch_vecs[0]), 384)

    def test_vector_indexing_and_metadata_preservation(self):
        """Verify vector indexing in ChromaDB preserves deterministic IDs and metadata."""
        doc_id = "test-doc-meta-001"
        chunks = [
            {
                "text": "The CPU scheduler selects from among the processes in ready memory.",
                "metadata": {
                    "document_id": doc_id,
                    "page": 1,
                    "chunk_index": 0,
                    "source": "os_concepts.pdf",
                },
            },
            {
                "text": "Virtual memory separation of user logical memory from physical memory.",
                "metadata": {
                    "document_id": doc_id,
                    "page": 2,
                    "chunk_index": 1,
                    "source": "os_concepts.pdf",
                },
            },
        ]

        # Index document
        result = self.vector_store.index_document(doc_id, chunks)
        self.assertEqual(result["document_id"], doc_id)
        self.assertEqual(result["chunk_count"], 2)
        self.assertEqual(result["indexed_count"], 2)
        self.assertEqual(result["embedding_dimension"], 384)

        # Verify records in ChromaDB
        coll = self.vector_store.collection
        records = coll.get(where={"document_id": doc_id}, include=["metadatas", "documents"])
        self.assertEqual(len(records["ids"]), 2)
        self.assertIn(f"{doc_id}:0", records["ids"])
        self.assertIn(f"{doc_id}:1", records["ids"])

        for meta in records["metadatas"]:
            self.assertEqual(meta["document_id"], doc_id)
            self.assertEqual(meta["source"], "os_concepts.pdf")
            self.assertIn(meta["page"], [1, 2])

        # Cleanup
        self.vector_store.delete_document_vectors(doc_id)

    def test_idempotent_indexing(self):
        """Verify indexing the same document twice does not create duplicate vectors."""
        doc_id = "test-doc-idempotent-002"
        chunks = [
            {
                "text": "Idempotent vector insertion test chunk A.",
                "metadata": {"document_id": doc_id, "page": 1, "chunk_index": 0, "source": "test.pdf"},
            },
            {
                "text": "Idempotent vector insertion test chunk B.",
                "metadata": {"document_id": doc_id, "page": 1, "chunk_index": 1, "source": "test.pdf"},
            },
        ]

        # First indexing
        self.vector_store.index_document(doc_id, chunks)
        count_first = self.vector_store.count_document_vectors(doc_id)
        self.assertEqual(count_first, 2)

        # Second indexing
        self.vector_store.index_document(doc_id, chunks)
        count_second = self.vector_store.count_document_vectors(doc_id)
        self.assertEqual(count_second, 2)

        # Cleanup
        self.vector_store.delete_document_vectors(doc_id)

    def test_reindex_shrink_removes_stale_chunks(self):
        """Verify that when a document shrinks in chunk count, stale chunks from the previous index are purged."""
        doc_id = "test-doc-shrink-003"

        # Initial index with 3 chunks (indices 0, 1, 2)
        initial_chunks = [
            {
                "text": f"Chunk content version 1 number {i}",
                "metadata": {"document_id": doc_id, "page": i + 1, "chunk_index": i, "source": "shrink.pdf"},
            }
            for i in range(3)
        ]
        self.vector_store.index_document(doc_id, initial_chunks)
        self.assertEqual(self.vector_store.count_document_vectors(doc_id), 3)

        # Re-index with only 1 chunk (index 0)
        shrunk_chunks = [
            {
                "text": "Chunk content version 2 number 0 only",
                "metadata": {"document_id": doc_id, "page": 1, "chunk_index": 0, "source": "shrink.pdf"},
            }
        ]
        self.vector_store.index_document(doc_id, shrunk_chunks)
        self.assertEqual(self.vector_store.count_document_vectors(doc_id), 1)

        # Confirm old chunks indices 1 and 2 are gone
        coll = self.vector_store.collection
        records = coll.get(where={"document_id": doc_id})
        self.assertEqual(records["ids"], [f"{doc_id}:0"])

        # Cleanup
        self.vector_store.delete_document_vectors(doc_id)

    def test_multiple_documents_in_shared_collection(self):
        """Verify multiple documents coexist in the single shared collection and are filterable by document_id."""
        doc_a = "doc-a-multi-004"
        doc_b = "doc-b-multi-005"

        chunks_a = [
            {
                "text": "Document A details on network protocols TCP and UDP.",
                "metadata": {"document_id": doc_a, "page": 1, "chunk_index": 0, "source": "networking.pdf"},
            }
        ]
        chunks_b = [
            {
                "text": "Document B details on relational databases SQL and ACID.",
                "metadata": {"document_id": doc_b, "page": 1, "chunk_index": 0, "source": "databases.pdf"},
            },
            {
                "text": "Document B second chunk on B-Tree indexing.",
                "metadata": {"document_id": doc_b, "page": 2, "chunk_index": 1, "source": "databases.pdf"},
            },
        ]

        self.vector_store.index_document(doc_a, chunks_a)
        self.vector_store.index_document(doc_b, chunks_b)

        self.assertEqual(self.vector_store.count_document_vectors(doc_a), 1)
        self.assertEqual(self.vector_store.count_document_vectors(doc_b), 2)

        # Cleanup
        self.vector_store.delete_document_vectors(doc_a)
        self.vector_store.delete_document_vectors(doc_b)

    def test_semantic_similarity_search(self):
        """Verify semantic similarity search returns top matching chunks with accurate metadata."""
        doc_id = "test-doc-search-006"
        chunks = [
            {
                "text": "Deadlock prevention requires ensuring that at least one of the four necessary conditions cannot hold.",
                "metadata": {"document_id": doc_id, "page": 10, "chunk_index": 0, "source": "os.pdf"},
            },
            {
                "text": "A socket is defined as an endpoint for communication identified by an IP address and a port number.",
                "metadata": {"document_id": doc_id, "page": 20, "chunk_index": 1, "source": "os.pdf"},
            },
        ]

        self.vector_store.index_document(doc_id, chunks)

        # Search for deadlock concepts
        results = self.vector_store.similarity_search(
            query="How to prevent system deadlocks?",
            k=1,
            document_id=doc_id,
        )
        self.assertEqual(len(results), 1)
        self.assertIn("Deadlock prevention", results[0]["text"])
        self.assertEqual(results[0]["metadata"]["page"], 10)
        self.assertEqual(results[0]["metadata"]["document_id"], doc_id)

        # Search for network communication concepts
        results_socket = self.vector_store.similarity_search(
            query="network socket communication endpoints",
            k=1,
            document_id=doc_id,
        )
        self.assertEqual(len(results_socket), 1)
        self.assertIn("endpoint for communication", results_socket[0]["text"])
        self.assertEqual(results_socket[0]["metadata"]["page"], 20)

        # Cleanup
        self.vector_store.delete_document_vectors(doc_id)

    def test_api_indexing_endpoints(self):
        """Verify the FastAPI HTTP routes for indexing, stats, search, and deletion."""
        # 1. Stats endpoint
        stats_resp = self.client.get("/api/indexing/stats")
        self.assertEqual(stats_resp.status_code, 200)
        self.assertEqual(stats_resp.json()["collection_name"], config.CHROMA_COLLECTION_NAME)
        self.assertEqual(stats_resp.json()["embedding_dimension"], 384)

        # 2. 404 on missing document file
        missing_resp = self.client.post("/api/indexing/documents/00000000-0000-0000-0000-000000000000")
        self.assertEqual(missing_resp.status_code, 404)

        # 3. 400 on empty document ID
        bad_id_resp = self.client.post("/api/indexing/documents/%20")
        self.assertEqual(bad_id_resp.status_code, 400)


if __name__ == "__main__":
    unittest.main()
