import cors from "cors";
import express, { Request, Response } from "express";
import { deleteItem, getItems, postItem, updateItem } from "./db.js";
import { logger } from "./logger.js";
import { updateShoppingItem } from "./shopping-items-service.js";
import { ValidationError, ItemNotFoundError } from "./errors.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
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

  try {
    const updatedItem = await updateShoppingItem({
      id, 
      text: req.body.text, 
      quantity: req.body.quantity, 
      completed: req.body.completed
    });
    return res.json(updatedItem);

  } catch(error) {
    logger.error(`Error updating item with id ${id}: ${JSON.stringify(error)}`);

    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    } else if (error instanceof ItemNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
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
