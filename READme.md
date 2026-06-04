# Chatbot API — Exam Voucher Platform

A lightweight Node.js/Express chatbot API that answers customer questions about exam voucher purchases using FAQ keyword matching, with an AI fallback powered by Claude (Anthropic).

---

## Architecture

```
User Message
    │
    ▼
Keyword Matcher (utils/keywordMatcher.js)
    │
    ├── Match found?  ──► Return FAQ answer  ──► Log to DB
    │
    └── No match?     ──► Claude AI fallback ──► Log to DB
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and Anthropic API key
```

### 3. Set up the database
```bash
psql -U postgres -d voucher_platform -f schema.sql
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Endpoints

### `POST /api/chatbot/message`
Send a user message and receive a bot response.

**Request body:**
```json
{
  "message": "How much do exam vouchers cost?",
  "sessionId": "optional-session-id-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Our exam voucher prices vary by certification...",
    "source": "faq",
    "faqId": 1
  }
}
```

- `source`: `"faq"` if answered from FAQ data, `"ai"` if answered by Claude.
- `faqId`: The matched FAQ entry ID (or `null` for AI responses).

---

### `GET /api/chatbot/faqs`
Returns all FAQ entries (useful for displaying on your site's help page).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "How much do exam vouchers cost?",
      "answer": "Our exam voucher prices vary..."
    }
  ]
}
```

---

### `GET /health`
Health check endpoint.

```json
{ "status": "ok", "timestamp": "2024-06-01T10:00:00.000Z" }
```

---

## Rate Limiting
- **20 requests per IP per minute** on all `/api/chatbot/*` routes.
- Returns `429 Too Many Requests` when exceeded.

---

## Extending the FAQ
Edit `data/faq.json` to add new entries. Each entry needs:
```json
{
  "id": 13,
  "keywords": ["word1", "phrase one", "word2"],
  "question": "Human-readable question",
  "answer": "The answer the bot will return."
}
```
Keywords support both single words and multi-word phrases.

---

## Project Structure
```
chatbot-api/
├── data/
│   └── faq.json              # FAQ entries with keywords
├── routes/
│   └── chatbotRoutes.js      # Express route definitions
├── controllers/
│   └── chatbotController.js  # Request/response handling
├── services/
│   └── chatbotService.js     # Core logic: FAQ + AI + DB logging
├── utils/
│   └── keywordMatcher.js     # Keyword scoring algorithm
├── db.js                     # PostgreSQL pool
├── app.js                    # Express app + middleware
├── server.js                 # Entry point
├── schema.sql                # Database table definitions
├── .env.example              # Environment variables template
└── package.json
```