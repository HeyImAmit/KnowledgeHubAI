import { query, pool } from "../config/database.js";

async function seedDocuments() {
  console.log("Seeding sample document metadata into PostgreSQL...");

  const seedData = [
    {
      filename: "operating-systems-silberschatz-10e.pdf",
      original_name: "Operating Systems.pdf",
      mime_type: "application/pdf",
      file_size: 14889728, // 14.2 MB
      page_count: 420,
      status: "INDEXED",
    },
    {
      filename: "database-system-concepts-ramakrishnan.pdf",
      original_name: "Database Management Systems.pdf",
      mime_type: "application/pdf",
      file_size: 10276044, // 9.8 MB
      page_count: 310,
      status: "INDEXED",
    },
    {
      filename: "computer-networking-top-down-kurose.pdf",
      original_name: "Computer Networks.pdf",
      mime_type: "application/pdf",
      file_size: 8493465, // 8.1 MB
      page_count: 285,
      status: "INDEXED",
    },
    {
      filename: "distributed-systems-coulouris-5e.pdf",
      original_name: "Distributed Systems Concepts.pdf",
      mime_type: "application/pdf",
      file_size: 6710886, // 6.4 MB
      page_count: 195,
      status: "INDEXED",
    },
    {
      filename: "system-design-primer-guide.pdf",
      original_name: "System Design Primer.pdf",
      mime_type: "application/pdf",
      file_size: 5452595, // 5.2 MB
      page_count: 160,
      status: "PROCESSING",
    },
    {
      filename: "database-internals-alex-petrov.pdf",
      original_name: "Modern Database Internals.pdf",
      mime_type: "application/pdf",
      file_size: 7864320, // 7.5 MB
      page_count: 212,
      status: "FAILED",
    },
  ];

  try {
    for (const doc of seedData) {
      const sql = `
        INSERT INTO documents (filename, original_name, mime_type, file_size, page_count, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      `;
      await query(sql, [
        doc.filename,
        doc.original_name,
        doc.mime_type,
        doc.file_size,
        doc.page_count,
        doc.status,
      ]);
    }

    const countRes = await query("SELECT COUNT(*) FROM documents;");
    console.log(`Seeding complete. Total documents in database: ${countRes.rows[0].count}`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedDocuments();
