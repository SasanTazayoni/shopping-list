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
- Axios for API communication
- Vite for development and bundling

**Backend**

- Node.js with Express and TypeScript
- PostgreSQL database
- REST API with 4 endpoints

## Getting Started

**Clone the repository:**

```bash
git clone https://github.com/SasanTazayoni/shopping-list.git
cd shopping-list
```

**Install dependencies** (run each from the project root):

```bash
cd client && npm install
```

```bash
cd server && npm install
```

**Set up environment variables:**

Create `server/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
```

**Initialise the database:**

```bash
cd server
npm run init-db
```

**Start the app** (two terminals):

```bash
# Terminal 1 — API server
cd server
npm run dev
```

```bash
# Terminal 2 — Frontend
cd client
npm run dev
```

Then open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| GET    | `/api/shopping-items`     | Get all items  |
| POST   | `/api/shopping-items`     | Add a new item |
| PUT    | `/api/shopping-items/:id` | Update an item |
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
cd client && npm run test
```

## Deployment

The app is deployed as two separate Heroku apps — one for the client and one for the server.

**Infrastructure:**

- Frontend → `shopping-list-client` (Heroku)
- Backend → `shopping-list-server` (Heroku)
- Database → PostgreSQL on [Neon](https://neon.tech)

**CI/CD:**

GitHub Actions workflows handle deployment automatically on push to `main`:

- Changes in `client/` trigger the frontend deploy
- Changes in `server/` trigger the backend deploy

Both workflows lint and test before deploying. The `build.yml` workflow runs on pull requests.

**Required GitHub secret:**

| Secret | Description |
| ------ | ----------- |
| `HEROKU_API_KEY` | From Heroku → Account Settings → API Key |

**Required Heroku config vars:**

`shopping-list-server`:

| Variable | Value |
| -------- | ----- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `CLIENT_ORIGIN` | URL of the deployed frontend |
| `NPM_CONFIG_PRODUCTION` | `false` |

`shopping-list-client`:

| Variable | Value |
| -------- | ----- |
| `VITE_API_URL` | URL of the deployed backend |
| `NPM_CONFIG_PRODUCTION` | `false` |
