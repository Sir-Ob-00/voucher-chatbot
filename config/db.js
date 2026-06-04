/**
 * config/db.js
 * PostgreSQL connection pool using pg.
 */

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME     || "voucher_chatbot",
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "Owusu.Boateng89",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err.message);
});

// Test connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error("Failed to connect to PostgreSQL:", err.message);
    } else {
        console.log("PostgreSQL connected successfully.");
        release();
    }
});

export default pool;