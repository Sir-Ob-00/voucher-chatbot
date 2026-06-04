/**
 * routes/chatbotRoutes.js
 */

import { Router } from "express";
import { handleMessage, listFAQs } from "../controllers/chatbotController.js";

const router = Router();

// POST /api/chatbot/message  — main chat endpoint
router.post("/message", handleMessage);

// GET  /api/chatbot/faqs     — list all FAQ entries
router.get("/faqs", listFAQs);

export default router;