import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log("Starting PostgreSQL database migration...");

  try {
    const migrationFile = path.join(__dirname, "001_create_documents_table.sql");
    const sql = fs.readFileSync(migrationFile, "utf-8");

    console.log("Executing migration: 001_create_documents_table.sql");
    await query(sql);

    console.log("Migration completed successfully. 'documents' table is ready.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigrations();
