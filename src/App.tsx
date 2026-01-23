import { useEffect, useState } from "react";
import "./css/styles.css";

type TodoItem = {
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

type StoredTodoItem = {
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

const STORAGE_KEY = "shoppingList";

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shoppingList, setShoppingList] = useState<TodoItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: StoredTodoItem[] = JSON.parse(stored);

    return parsed.map((item) => ({
      text: item.text,
      completed: item.completed,
      createdAt: new Date(item.createdAt),
      completedAt: item.completedAt ? new Date(item.completedAt) : null,
    }));
  });

  useEffect(() => {
    const toStore: StoredTodoItem[] = shoppingList.map((item) => ({
      text: item.text,
      completed: item.completed,
      createdAt: item.createdAt.toISOString(),
      completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [shoppingList]);

  function addListItem() {
    const value = itemToAdd.trim();
    if (value === "") return;

    setShoppingList((prev) => [
      ...prev,
      {
        text: value,
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
    ]);

    setItemToAdd("");
  }

  function addListItemKeyboard(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addListItem();
    }
  }

  function toggleItem(indexToToggle: number) {
    setShoppingList((prev) =>
      prev.map((item, index) =>
        index === indexToToggle
          ? {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date() : null,
            }
          : item,
      ),
    );
  }

  function removeItem(indexToRemove: number) {
    setShoppingList((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  }

  function sortShoppingList() {
    setShoppingList((prev) => {
      const sorted = [...prev].sort((a, b) =>
        sortOrder === "asc"
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text),
      );
      return sorted;
    });

    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  function checkUncheckAllItems() {
    const allCompleted = shoppingList.every((item) => item.completed);
    const now = new Date();

    setShoppingList((prev) =>
      prev.map((item) => ({
        ...item,
        completed: !allCompleted,
        completedAt: !allCompleted ? now : null,
      })),
    );
  }

  function formatDate(date: Date | null) {
    return date ? date.toLocaleString() : "—";
  }

  return (
    <div className="app">
      <h1>Shopping List</h1>

      <div className="controls">
        <input
          type="text"
          value={itemToAdd}
          onChange={(e) => setItemToAdd(e.target.value)}
          onKeyDown={addListItemKeyboard}
          placeholder="Add an item…"
        />
        <button onClick={addListItem}>✓</button>
        <button onClick={sortShoppingList}>
          {sortOrder === "asc" ? "A→Z" : "Z→A"}
        </button>
      </div>

      <label className="toggle-all">
        <input
          type="checkbox"
          checked={
            shoppingList.length > 0 &&
            shoppingList.every((item) => item.completed)
          }
          onChange={checkUncheckAllItems}
        />
        Check/Uncheck all
      </label>

      <ul className="list">
        {shoppingList.map((item, index) => (
          <li key={index} className="list-item">
            <div className="item-main">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(index)}
              />
              <span className={item.completed ? "completed" : ""}>
                {item.text}
              </span>
              <button className="delete" onClick={() => removeItem(index)}>
                ✕
              </button>
            </div>

            <div className="item-meta">
              <small>Created: {formatDate(item.createdAt)}</small>
              <small>Completed: {formatDate(item.completedAt)}</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
