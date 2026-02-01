import type { TodoItem } from "../App";

type ShoppingListProps = {
  shoppingList: TodoItem[];
  toggleItem: (index: number) => void;
  removeItem: (index: number) => void;
  formatDate: (date: Date | null) => string;
};

export default function ShoppingList({
  shoppingList,
  toggleItem,
  removeItem,
  formatDate,
}: ShoppingListProps) {
  return (
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
  );
}
