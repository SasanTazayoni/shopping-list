import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(serverDir, "schema.sql"), "utf-8");

db.exec(schema);
console.log("Database initialized.");
db.close();
