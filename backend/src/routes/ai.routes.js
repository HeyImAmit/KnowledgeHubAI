import { Router } from "express";
import { checkAIService } from "../services/ai.service.js";

const router = Router();

router.get("/health", async (req, res, next) => {
  try {
    const data = await checkAIService();

    res.json({
      backend: "healthy",
      aiService: data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;