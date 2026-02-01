import { useState } from "react";
import type { TodoItem } from "../App";

type ShoppingListProps = {
  shoppingList: TodoItem[];
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  editItem: (id: string, newText: string) => void;
  formatDate: (date: Date | null) => string;
};

export default function ShoppingList({
  shoppingList,
  toggleItem,
  removeItem,
  editItem,
  formatDate,
}: ShoppingListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function startEditing(id: string, currentText: string) {
    setEditingId(id);
    setEditText(currentText);
  }

  function saveEdit(id: string) {
    if (editText.trim()) {
      editItem(id, editText.trim());
    }
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
              </span>
            )}

            {/* Show save button when editing, edit button when not */}
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

            {/* When editing: ✕ cancels. When not editing: ✕ deletes */}
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
