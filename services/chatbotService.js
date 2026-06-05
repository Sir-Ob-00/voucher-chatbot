/**
 * services/chatbotService.js
 * Core business logic: FAQ lookup → AI fallback → DB logging.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";
import pool from "../config/db.js";
import { findBestMatch } from "../utils/keywordMatcher.js";

// JSON imports require a require() shim until import assertions are stable in Node
const require = createRequire(import.meta.url);
const faqData = require("../data/faq.json");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_CONTEXT = `
You are a helpful customer support chatbot for an online exam voucher purchasing platform.
You assist customers with questions about buying exam vouchers, pricing, payment methods,
delivery, refunds, and how to use vouchers for IT certifications (CompTIA, Microsoft, AWS, Cisco, etc.).
Be concise, friendly, and professional. If you don't know something specific about the platform,
advise the user to contact human support. Never make up pricing or policy details.
`.trim();

/**
 * Processes a user message: tries FAQ first, falls back to AI, logs to DB.
 * @param {string} userMessage
 * @param {string|null} sessionId
 * @returns {Promise<{ answer: string, source: 'faq'|'ai', faqId: number|null }>}
 */

const greetings = [
    "hi",
    "hello",
    "hey",
    "yo",
    "good morning",
    "good afternoon",
    "good evening",
    "good day",
    "greetings",
    "are you there",
    "hi there",
    "what's up",
    "whats up",
    "wasup",
    "howdy",
    "sup",
    "sap"
];

const smallTalkPatterns = [
    "how are you",
    "how is it going",
    "how are things",
    "what's new",
    "whats new",
    "how's it going",
    "how are you doing",
    "how do you do",
];

const processMessage = async (userMessage, sessionId = null) => {
    if (!userMessage || typeof userMessage !== "string") {
        throw new Error("Invalid message: must be a non-empty string.");
    }

    const trimmed = userMessage.trim();
    const normalized = trimmed.toLowerCase();
    if (trimmed.length === 0) throw new Error("Message cannot be empty.");
    if (trimmed.length > 1000) throw new Error("Message too long. Max 1000 characters.");

    let answer;
    let source;
    let faqId = null;

    // 0. Handle greetings FIRST (before FAQ)
    const isGreeting = greetings.some(g =>
        normalized === g || normalized.startsWith(g + " "));

        if (isGreeting) {
        return {
            answer: "Hello! How can I help you today?",
            source: "greeting",
            faqId: null
        };
    }

    //Small talk / greetings
    if (smallTalkPatterns.some(p => normalized.includes(p))) {
        return {
            answer:
            "I'm doing well. I'm here to help you with exam vouchers, pricing, payments, and results. How can I assist you today?",
            source: "smalltalk",
            faqId: null
        };
    }

  // 1. Try FAQ keyword matching
    const { match, score } = findBestMatch(trimmed, faqData, 1);

    if (match) {
        answer = match.answer;
        source = "faq";
        faqId = match.id;
    } else {
        // 2. Fall back to Claude AI
        try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            system: PLATFORM_CONTEXT,
            messages: [{ role: "user", content: trimmed }],
        });

        answer =
            response.content?.[0]?.text?.trim() ||
            "I'm not sure about that. Please contact our support team for help.";
        source = "ai";
        } catch (aiError) {
            console.error("AI fallback error:", aiError.message);
            answer = {
                        text: "Sorry, I couldn’t find an answer to that.",
                        suggestions: [
                            "Rephrasing your question",
                            "Asking about vouchers, pricing, payments, or results",
                            "Contacting support at gyasireindorf42@gmail.com or call 0556069880"
                        ]
                    };
            source = "ai";
        }
    }

  // 3. Log to PostgreSQL (non-fatal)
    try {
        await pool.query(
            `INSERT INTO chat_logs (session_id, user_message, bot_answer, source, faq_id, match_score)
            VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, trimmed, answer, source, faqId, score]
        );
    } catch (dbError) {
        console.error("DB logging error:", dbError.message);
    }

    return { answer, source, faqId };
};

/**
 * Returns all FAQ entries (for frontend display or admin).
 * @returns {Array}
 */
const getAllFAQs = () =>
    faqData.map(({ id, question, answer }) => ({ id, question, answer }));

export { processMessage, getAllFAQs };