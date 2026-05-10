import "dotenv/config";
import { readFileSync } from "fs";
import { pool } from "./db.js";

const sql = readFileSync(new URL("./schema.sql", import.meta.url), "utf-8");
await pool.query(sql);
console.log("Database initialized.");
await pool.end();
