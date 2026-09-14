import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRoutes from "./routes/health.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "KnowledgeHub API",
    status: "running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);

export default app;