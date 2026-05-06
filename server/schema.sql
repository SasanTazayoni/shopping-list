CREATE TABLE IF NOT EXISTS shopping_items (
  id           SERIAL PRIMARY KEY,
  text         TEXT        NOT NULL,
  quantity     INTEGER     NOT NULL DEFAULT 1,
  completed    BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
