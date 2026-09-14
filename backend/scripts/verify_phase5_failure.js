import pg from "pg";
import axios from "axios";

async function run() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/knowledgehub",
  });

  try {
    // 1. Insert a document record whose physical PDF does not exist
    const insertRes = await pool.query(
      "INSERT INTO documents (filename, original_name, mime_type, file_size, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, status",
      ["corrupt_or_missing_file_000.pdf", "nonexistent.pdf", "application/pdf", 1000, "PROCESSING"]
    );
    const docId = insertRes.rows[0].id;
    console.log(`1. Created test document in DB: ${docId}, Status: ${insertRes.rows[0].status}`);

    // 2. Trigger indexing via Node API
    try {
      await axios.post(`http://localhost:5000/api/documents/${docId}/index`);
      console.error("Expected indexing to fail, but it succeeded!");
    } catch (err) {
      console.log(`2. Indexing failed as expected with status: ${err.response?.status}`);
    }

    // 3. Verify PostgreSQL status transitioned to FAILED
    const verifyRes = await pool.query("SELECT id, status FROM documents WHERE id = $1", [docId]);
    console.log(`3. Verified PostgreSQL document status is: ${verifyRes.rows[0]?.status}`);

    if (verifyRes.rows[0]?.status === "FAILED") {
      console.log("SUCCESS: Document status transitioned to FAILED on indexing error.");
    } else {
      console.error(`FAILURE: Document status was ${verifyRes.rows[0]?.status}, expected FAILED.`);
    }

    // 4. Cleanup
    await pool.query("DELETE FROM documents WHERE id = $1", [docId]);
    console.log("4. Cleaned up test record.");
  } finally {
    await pool.end();
  }
}

run();
