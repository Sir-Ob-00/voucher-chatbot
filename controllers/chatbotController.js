/**
 * controllers/chatbotController.js
 * Handles HTTP request/response. Delegates logic to chatbotService.
 */

import { processMessage, getAllFAQs } from "../services/chatbotService.js";

/**
 * POST /api/chatbot/message
 * Body: { message: string, sessionId?: string }
 */
const handleMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: message",
      });
    }

    const { answer, source, faqId } = await processMessage(
      message,
      sessionId || null
    );

    return res.status(200).json({
      success: true,
      data: { answer, source, faqId },
    });
  } catch (err) {
    console.error("handleMessage error:", err.message);

    const status =
      err.message.includes("Invalid") ||
      err.message.includes("empty") ||
      err.message.includes("long")
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

/**
 * GET /api/chatbot/faqs
 */
const listFAQs = (req, res) => {
  try {
    const faqs = getAllFAQs();
    return res.status(200).json({ success: true, data: faqs });
  } catch (err) {
    console.error("listFAQs error:", err.message);
    return res.status(500).json({ success: false, error: "Could not load FAQs." });
  }
};

export { handleMessage, listFAQs };