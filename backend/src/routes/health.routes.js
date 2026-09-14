import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    service: "node-backend",
    status: "healthy"
  });
});

export default router;