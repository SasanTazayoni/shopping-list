import { useEffect, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./assets/components/ShoppingList";
import Controls from "./assets/components/Controls";
import ToggleAll from "./assets/components/ToggleAll";

export type TodoItem = {
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
    const now = new Date();

    setShoppingList((prev) =>
      prev.map((item) => {
        if (allCompleted) {
          return { ...item, completed: false, completedAt: null };
        }

        if (item.completed) {
          return item;
        }

        return { ...item, completed: true, completedAt: now };
      }),
    );
  }

  function formatDate(date: Date | null) {
    return date ? date.toLocaleString() : "—";
  }

  const allCompleted =
    shoppingList.length > 0 && shoppingList.every((item) => item.completed);

  return (
    <div className="app">
      <h1>Shopping List</h1>

      <Controls
        itemToAdd={itemToAdd}
        setItemToAdd={setItemToAdd}
        addListItem={addListItem}
        addListItemKeyboard={addListItemKeyboard}
        sortShoppingList={sortShoppingList}
        sortOrder={sortOrder}
      />

      <ToggleAll checked={allCompleted} onToggle={checkUncheckAllItems} />

      <ShoppingList
        shoppingList={shoppingList}
        toggleItem={toggleItem}
        removeItem={removeItem}
        formatDate={formatDate}
      />
    </div>
  );
}

export default App;
