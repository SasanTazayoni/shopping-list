import { useState } from "react";
import type { TodoItem } from "../reducers/shoppingListReducer";
import { formatDate } from "../utils/formatDate";

type ShoppingListProps = {
  shoppingList: TodoItem[];
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  editItem: (id: string, newText: string, quantity: number) => void;
  isPending: boolean;
};

export default function ShoppingList({
  shoppingList,
  toggleItem,
  removeItem,
  editItem,
  isPending,
}: ShoppingListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);

  function startEditing(
    id: string,
    currentText: string,
    currentQuantity: number,
  ) {
    setEditingId(id);
    setEditText(currentText);
    setEditQuantity(currentQuantity);
  }

  function saveEdit(id: string) {
    editItem(id, editText, editQuantity);
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);

    (document.activeElement as HTMLElement | null)?.blur();
  }

  function handleEditKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string,
  ) {
    if (e.key === "Enter") saveEdit(id);
    if (e.key === "Escape") cancelEdit();
  }

  function incrementQuantity() {
    setEditQuantity((currentQuantity) => currentQuantity + 1);
  }

  function decrementQuantity() {
    setEditQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  }

  return (
    <ul className="list">
      {shoppingList.map((item) => {
        const isEditing = editingId === item.id;

        return (
          <li key={item.id} className="list-item">
            <div className="item-main">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                disabled={isPending}
              />

              {isEditing ? (
                <>
                  <input
                    type="text"
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                    autoFocus
                  />
                  <div className="quantity-controls">
                    <button onClick={decrementQuantity}>−</button>
                    <span>{editQuantity}</span>
                    <button onClick={incrementQuantity}>+</button>
                  </div>
                </>
              ) : (
                <span className={item.completed ? "completed" : ""}>
                  {item.text} {item.quantity > 1 && ` (${item.quantity})`}
                </span>
              )}

              {isEditing ? (
                <button className="edit" onClick={() => saveEdit(item.id)} disabled={isPending}>
                  ✓
                </button>
              ) : (
                <button
                  className="edit"
                  onClick={() =>
                    startEditing(item.id, item.text, item.quantity)
                  }
                  disabled={isPending}
                >
                  ✎
                </button>
              )}

              <button
                className="delete"
                onClick={() =>
                  isEditing ? cancelEdit() : removeItem(item.id)
                }
                disabled={isPending}
              >
                ✕
              </button>
            </div>

            <div className="item-meta">
              <small>Created: {formatDate(item.createdAt)}</small>
              <small>Completed: {formatDate(item.completedAt)}</small>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
