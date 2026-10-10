import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(serverDir, "shopping.db"));

db.pragma("journal_mode = WAL");

export { db };

type SqliteRow = Record<string, unknown>;

export interface ShoppingItem {
  id: number;
  text: string;
  quantity: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

function deserializeRow(row: SqliteRow): ShoppingItem {
  return {
    id: row.id as number,
    text: row.text as string,
    quantity: row.quantity as number,
    completed: row.completed === 1,
    completed_at: (row.completed_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

export async function getItems() {
  const rows = db
    .prepare("SELECT * FROM shopping_items ORDER BY created_at ASC")
    .all()
    .map((rawRow: unknown) => deserializeRow(rawRow as SqliteRow));
  return { rows };
}

export async function postItem(text: string, quantity: number) {
  const insertResult = db
    .prepare("INSERT INTO shopping_items (text, quantity) VALUES (?, ?)")
    .run(text, quantity);
  const insertedRow = db
    .prepare("SELECT * FROM shopping_items WHERE id = ?")
    .get(insertResult.lastInsertRowid) as SqliteRow;
  return { rows: [deserializeRow(insertedRow)] };
}

export async function getItem(id: string) {
  const row = db
    .prepare("SELECT * FROM shopping_items WHERE id = ?")
    .get(id) as SqliteRow | undefined;
  return { rows: row ? [deserializeRow(row)] : [] };
}

export async function updateItem(
  text: string,
  quantity: number,
  completed: boolean,
  completed_at: string | null,
  id: string,
) {
  db.prepare(
    "UPDATE shopping_items SET text = ?, quantity = ?, completed = ?, completed_at = ? WHERE id = ?",
  ).run(text, quantity, completed ? 1 : 0, completed_at, id);
  const updatedRow = db
    .prepare("SELECT * FROM shopping_items WHERE id = ?")
    .get(id) as SqliteRow;
  return { rows: [deserializeRow(updatedRow)] };
}

export async function deleteItem(id: string) {
  const existingRow = db
    .prepare("SELECT id FROM shopping_items WHERE id = ?")
    .get(id) as SqliteRow | undefined;
  if (!existingRow) return { rows: [] };
  db.prepare("DELETE FROM shopping_items WHERE id = ?").run(id);
  return { rows: [existingRow] };
}
