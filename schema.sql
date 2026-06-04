-- schema.sql
-- Run this once to set up the database for the chatbot.

CREATE TABLE IF NOT EXISTS chat_logs (
    id            SERIAL PRIMARY KEY,
    session_id    VARCHAR(128),                        -- optional client session token
    user_message  TEXT        NOT NULL,
    bot_answer    TEXT        NOT NULL,
    source        VARCHAR(10) NOT NULL CHECK (source IN ('faq', 'ai')),
    faq_id        INTEGER,                             -- matched FAQ id (null if AI)
    match_score   INTEGER     DEFAULT 0,              -- keyword match score
    created_at    TIMESTAMP   DEFAULT NOW()
);

-- Index for session lookups (e.g., fetch conversation history)
CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs (session_id);

-- Index for analytics on source type
CREATE INDEX IF NOT EXISTS idx_chat_logs_source ON chat_logs (source);