import express, { Request, Response } from "express";
import { deleteItem, getItem, getItems, postItem, updateItem } from "./db.js";

const app = express();

app.use(express.json());

app.get("/api/shopping-items", async (_req: Request, res: Response) => {
  const result = await getItems();
  res.json(result.rows);
});

app.post("/api/shopping-items", async (req: Request, res: Response) => {
  const { text, quantity = 1 } = req.body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    res.status(400).json({ error: "text is required" });
    return;
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    res.status(400).json({ error: "quantity must be a positive integer" });
    return;
  }

  const result = await postItem(text, quantity);
  res.status(201).json(result.rows[0]);
});

app.put("/api/shopping-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (
    req.body.text !== undefined &&
    (typeof req.body.text !== "string" || req.body.text.trim() === "")
  ) {
    res.status(400).json({ error: "text must be a non-empty string" });
    return;
  }
  if (
    req.body.quantity !== undefined &&
    (!Number.isInteger(req.body.quantity) || req.body.quantity < 1)
  ) {
    res.status(400).json({ error: "quantity must be a positive integer" });
    return;
  }
  if (
    req.body.completed !== undefined &&
    typeof req.body.completed !== "boolean"
  ) {
    res.status(400).json({ error: "completed must be true or false" });
    return;
  }

  const existingItem = await getItem(id);

  if (existingItem.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const item = existingItem.rows[0];
  const text = req.body.text ?? item.text;
  const quantity = req.body.quantity ?? item.quantity;
  let completed = item.completed;
  let completed_at = item.completed_at;

  if (
    req.body.completed !== undefined &&
    req.body.completed !== item.completed
  ) {
    completed = req.body.completed;
    completed_at = completed ? new Date().toISOString() : null;
  }

  const result = await updateItem(text, quantity, completed, completed_at, id);

  res.json(result.rows[0]);
});

app.delete("/api/shopping-items/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await deleteItem(id);

  if (result.rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.status(204).send();
});

export default app;
