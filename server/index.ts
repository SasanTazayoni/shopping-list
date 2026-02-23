import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
};

let shoppingItems: ShoppingItem[] = [];

app.get("/api/shopping-items", (_req: Request, res: Response) => {
  res.json(shoppingItems);
});

app.post("/api/shopping-items", (req: Request, res: Response) => {
  const newItem: ShoppingItem = {
    id: crypto.randomUUID(),
    name: req.body.name,
    quantity: req.body.quantity ?? 1,
    completed: false,
  };
  shoppingItems.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/shopping-items/:id", (req: Request, res: Response) => {
  const item = shoppingItems.find((i) => i.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  item.name = req.body.name ?? item.name;
  item.quantity = req.body.quantity ?? item.quantity;
  item.completed = req.body.completed ?? item.completed;
  res.json(item);
});

app.delete("/api/shopping-items/:id", (req: Request, res: Response) => {
  const index = shoppingItems.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  shoppingItems.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
