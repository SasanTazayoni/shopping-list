CREATE TABLE IF NOT EXISTS shopping_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  text         TEXT    NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1,
  completed    INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
