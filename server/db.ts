import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getItems() {
  return await pool.query(
    "SELECT * FROM shopping_items ORDER BY created_at ASC",
  );
}

export async function postItem(text: string, quantity: number) {
  return await pool.query(
    "INSERT INTO shopping_items (text, quantity) VALUES ($1, $2) RETURNING *",
    [text, quantity],
  );
}

export async function getItem(id: string) {
  return await pool.query("SELECT * FROM shopping_items WHERE id = $1", [id]);
}

export async function updateItem(
  text: string,
  quantity: number,
  completed: boolean,
  completed_at: string | null,
  id: string,
) {
  return await pool.query(
    "UPDATE shopping_items SET text = $1, quantity = $2, completed = $3, completed_at = $4 WHERE id = $5 RETURNING *",
    [text, quantity, completed, completed_at, id],
  );
}

export async function deleteItem(id: string) {
  return await pool.query(
    "DELETE FROM shopping_items WHERE id = $1 RETURNING id",
    [id],
  );
}
