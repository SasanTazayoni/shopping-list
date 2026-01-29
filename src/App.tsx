import { useEffect, useRef, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./assets/components/ShoppingList";
import Controls from "./assets/components/Controls";
import ToggleAll from "./assets/components/ToggleAll";
import { toggleAllItems, toggleItemAtIndex } from "./utils/shoppingListLogic";

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

  const inputRef = useRef<HTMLInputElement>(null);

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
    const value = inputRef.current?.value.trim();
    if (!value) return;

    setShoppingList((prev) => [
      ...prev,
      {
        text: value,
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      },
    ]);

    inputRef.current!.value = "";
  }

  function addListItemKeyboard(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addListItem();
    }
  }

  function toggleItem(indexToToggle: number) {
    const now = new Date();
    setShoppingList((prev) => toggleItemAtIndex(prev, indexToToggle, now));
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
    setShoppingList((prev) => toggleAllItems(prev, allCompleted, now));
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
        inputRef={inputRef}
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
