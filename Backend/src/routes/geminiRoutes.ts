import express from "express";
import { generateContent } from "../controllers/geminiController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.post("/generate", authenticate, generateContent);

export default router;
