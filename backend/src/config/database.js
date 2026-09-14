import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/knowledgehub";

export const pool = new Pool({
  connectionString,
});

export const query = (text, params) => pool.query(text, params);

export async function testConnection() {
  try {
    const res = await query("SELECT NOW()");
    console.log("PostgreSQL connected successfully at:", res.rows[0].now);
    return true;
  } catch (error) {
    console.error("PostgreSQL connection error:", error.message);
    return false;
  }
}

export default {
  pool,
  query,
  testConnection,
};
