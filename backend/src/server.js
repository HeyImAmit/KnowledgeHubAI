import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`KnowledgeHub backend running on port ${PORT}`);
  await testConnection();
});