import express, { Request, Response } from "express";
import pool from "./db.js";

const app = express();

app.use(express.json());

app.get("/api/shopping-items", async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM shopping_items ORDER BY created_at ASC");
  res.json(result.rows);
});

app.post("/api/shopping-items", async (req: Request, res: Response) => {
  const { text, quantity = 1 } = req.body;
  const result = await pool.query(
    "INSERT INTO shopping_items (text, quantity) VALUES ($1, $2) RETURNING *",
    [text, quantity]
  );
  res.status(201).json(result.rows[0]);
});

app.put("/api/shopping-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await pool.query("SELECT * FROM shopping_items WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const item = existing.rows[0];
  const text = req.body.text ?? item.text;
  const quantity = req.body.quantity ?? item.quantity;
  let completed = item.completed;
  let completed_at = item.completed_at;

  if (req.body.completed !== undefined && req.body.completed !== item.completed) {
    completed = req.body.completed;
    completed_at = completed ? new Date().toISOString() : null;
  }

  const result = await pool.query(
    "UPDATE shopping_items SET text = $1, quantity = $2, completed = $3, completed_at = $4 WHERE id = $5 RETURNING *",
    [text, quantity, completed, completed_at, id]
  );
  res.json(result.rows[0]);
});

app.delete("/api/shopping-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("DELETE FROM shopping_items WHERE id = $1 RETURNING id", [id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.status(204).send();
});

export default app;
