import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "./app.js";
import pool from "./db.js";

vi.mock("./db.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockQuery.mockReset();
});

describe("GET /api/shopping-items", () => {
  it("returns a list of shopping items", async () => {
    const fakeItems = [
      {
        id: "1",
        text: "Milk",
        quantity: 2,
        completed: false,
        created_at: "2026-01-01",
        completed_at: null,
      },
    ];
    mockQuery.mockResolvedValueOnce({ rows: fakeItems });

    const res = await request(app).get("/api/shopping-items");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeItems);
  });
});

describe("POST /api/shopping-items", () => {
  it("creates a new shopping item", async () => {
    const fakeItem = {
      id: "1",
      text: "Milk",
      quantity: 2,
      completed: false,
      created_at: "2026-01-01",
      completed_at: null,
    };
    mockQuery.mockResolvedValueOnce({ rows: [fakeItem] });

    const res = await request(app)
      .post("/api/shopping-items")
      .send({ text: "Milk", quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeItem);
  });
});

describe("PUT /api/shopping-items/:id", () => {
  it("updates an existing shopping item", async () => {
    const existingItem = {
      id: "1",
      text: "Milk",
      quantity: 2,
      completed: false,
      created_at: "2026-01-01",
      completed_at: null,
    };
    const updatedItem = { ...existingItem, quantity: 5 };
    mockQuery.mockResolvedValueOnce({ rows: [existingItem] });
    mockQuery.mockResolvedValueOnce({ rows: [updatedItem] });

    const res = await request(app)
      .put("/api/shopping-items/1")
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedItem);
  });

  it("returns 404 if item not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .put("/api/shopping-items/999")
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
  });

  it("updates completed status and sets completed_at", async () => {
    const existingItem = {
      id: "1",
      text: "Milk",
      quantity: 2,
      completed: false,
      created_at: "2026-01-01",
      completed_at: null,
    };
    const updatedItem = {
      ...existingItem,
      completed: true,
      completed_at: "2026-04-01T00:00:00.000Z",
    };
    mockQuery.mockResolvedValueOnce({ rows: [existingItem] });
    mockQuery.mockResolvedValueOnce({ rows: [updatedItem] });

    const res = await request(app)
      .put("/api/shopping-items/1")
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.completed_at).not.toBeNull();
  });

  it("clears completed_at when item is uncompleted", async () => {
    const existingItem = {
      id: "1",
      text: "Milk",
      quantity: 2,
      completed: true,
      created_at: "2026-01-01",
      completed_at: "2026-04-01T00:00:00.000Z",
    };
    const updatedItem = {
      ...existingItem,
      completed: false,
      completed_at: null,
    };
    mockQuery.mockResolvedValueOnce({ rows: [existingItem] });
    mockQuery.mockResolvedValueOnce({ rows: [updatedItem] });

    const res = await request(app)
      .put("/api/shopping-items/1")
      .send({ completed: false });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(false);
    expect(res.body.completed_at).toBeNull();
  });
});

describe("DELETE /api/shopping-items/:id", () => {
  it("deletes an existing shopping item", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "1" }] });

    const res = await request(app).delete("/api/shopping-items/1");

    expect(res.status).toBe(204);
  });

  it("returns 404 if item not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete("/api/shopping-items/999");

    expect(res.status).toBe(404);
  });
});
