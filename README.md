# Shopping List App

A full-stack shopping list app built with React (frontend) and Express (backend).

## Features

- Add, edit, and delete shopping items
- Mark items as completed
- Toggle all items complete/incomplete
- Filter by text search or hide completed items
- Sort items A→Z or Z→A (auto-applies to new items)

## Tech Stack

**Frontend**
- React 19 with TypeScript
- `useReducer` for state management
- `fetch` for API communication
- Vite for development and bundling

**Backend**
- Node.js with Express
- In-memory storage (no database)
- REST API with 4 endpoints

## Getting Started

**Clone the repository:**
```bash
git clone https://github.com/your-username/my-inventory.git
cd my-inventory
npm install
```

You need two terminals running at the same time:

**Terminal 1 — Start the API server:**
```bash
npm run server
```

**Terminal 2 — Start the frontend:**
```bash
npm run dev
```

Then open `http://localhost:5173/shopping-list/` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shopping-items` | Get all items |
| POST | `/api/shopping-items` | Add a new item |
| PUT | `/api/shopping-items/:id` | Update an item |
| DELETE | `/api/shopping-items/:id` | Delete an item |

### Example curl commands

```bash
# Get all items
curl http://localhost:3000/api/shopping-items

# Add an item
curl -X POST --data "{\"text\":\"Milk\"}" -H "Content-Type: application/json" http://localhost:3000/api/shopping-items

# Update an item
curl -X PUT --data "{\"text\":\"Oat Milk\",\"quantity\":2}" -H "Content-Type: application/json" http://localhost:3000/api/shopping-items/<id>

# Delete an item
curl -X DELETE http://localhost:3000/api/shopping-items/<id>
```

## Running Tests

```bash
npm test
```
