import { useState } from "react";
import type { TodoItem } from "../App";
import { formatDate } from "../utils/formatDate";

type ShoppingListProps = {
  shoppingList: TodoItem[];
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  editItem: (id: string, newText: string) => void;
};

export default function ShoppingList({
  shoppingList,
  toggleItem,
  removeItem,
  editItem,
}: ShoppingListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function startEditing(id: string, currentText: string) {
    setEditingId(id);
    setEditText(currentText);
  }

  function saveEdit(id: string) {
    editItem(id, editText);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);

    (document.activeElement as HTMLElement | null)?.blur();
  }

  return (
    <ul className="list">
      {shoppingList.map((item) => (
        <li key={item.id} className="list-item">
          <div className="item-main">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
            />

            {editingId === item.id ? (
              <input
                type="text"
                className="edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(item.id);
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
              />
            ) : (
              <span className={item.completed ? "completed" : ""}>
                {item.text}
                {item.quantity > 1 && ` (${item.quantity})`}
              </span>
            )}

            {editingId === item.id ? (
              <button className="edit" onClick={() => saveEdit(item.id)}>
                ✓
              </button>
            ) : (
              <button
                className="edit"
                onClick={() => startEditing(item.id, item.text)}
              >
                ✎
              </button>
            )}

            <button
              className="delete"
              onClick={() =>
                editingId === item.id ? cancelEdit() : removeItem(item.id)
              }
            >
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
  );
}
