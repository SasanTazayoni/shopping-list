import { useEffect, useReducer, useRef, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./components/ShoppingList";
import Controls from "./components/Controls";
import ToggleAll from "./components/ToggleAll";
import { toggleAllItems, toggleItemById } from "./utils/shoppingListLogic";
import FilterForm from "./components/FilterForm";

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

type StoredTodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type ShoppingListAction =
  | { type: "ADD_ITEM"; payload: string }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "EDIT_ITEM"; payload: { id: string; text: string } }
  | { type: "TOGGLE_ITEM"; payload: string }
  | { type: "SORT_LIST"; payload: "asc" | "desc" }
  | { type: "TOGGLE_ALL"; payload: boolean };

export function shoppingListReducer(
  state: TodoItem[],
  action: ShoppingListAction,
): TodoItem[] {
  switch (action.type) {
    case "ADD_ITEM":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          text: action.payload.trim(),
          completed: false,
          createdAt: new Date(),
          completedAt: null,
        },
      ];

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "TOGGLE_ITEM":
      return toggleItemById(state, action.payload, new Date());

    case "SORT_LIST":
      return [...state].sort((a, b) =>
        action.payload === "asc"
          ? a.text.localeCompare(b.text)
          : b.text.localeCompare(a.text),
      );

    case "TOGGLE_ALL":
      return toggleAllItems(state, action.payload, new Date());

    case "EDIT_ITEM":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, text: action.payload.text }
          : item,
      );

    default:
      return state;
  }
}

const STORAGE_KEY = "shoppingList";

function App() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shoppingList, dispatch] = useReducer(shoppingListReducer, null, () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: StoredTodoItem[] = JSON.parse(stored);
    return parsed.map((item) => ({
      id: item.id || crypto.randomUUID(),
      text: item.text,
      completed: item.completed,
      createdAt: new Date(item.createdAt),
      completedAt: item.completedAt ? new Date(item.completedAt) : null,
    }));
  });
  const [filterText, setFilterText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [toastFading, setToastFading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const toastFadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const toStore: StoredTodoItem[] = shoppingList.map((item) => ({
      id: item.id,
      text: item.text,
      completed: item.completed,
      createdAt: item.createdAt.toISOString(),
      completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [shoppingList]);

  const filteredList = shoppingList.filter((item) => {
    const filteredSearch = item.text
      .toLowerCase()
      .includes(filterText.toLowerCase());

    const display = !hideCompleted || !item.completed;

    return filteredSearch && display;
  });

  function addListItem() {
    const value = inputRef.current?.value?.trim();
    if (!value) return;

    const itemExists = shoppingList.some(
      (item) => item.text.toLowerCase() === value.toLowerCase(),
    );

    if (itemExists) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (toastFadeTimeoutRef.current)
        clearTimeout(toastFadeTimeoutRef.current);

      setDuplicateMessage(`"${value}" is already in your list`);
      setToastFading(false);
      toastTimeoutRef.current = setTimeout(() => {
        setToastFading(true);
        toastFadeTimeoutRef.current = setTimeout(
          () => setDuplicateMessage(""),
          500,
        );
      }, 2500);
      return;
    }

    dispatch({ type: "ADD_ITEM", payload: value });
    inputRef.current!.value = "";
  }

  function addListItemKeyboard(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addListItem();
    }
  }

  function toggleItem(id: string) {
    dispatch({ type: "TOGGLE_ITEM", payload: id });
  }

  function removeItem(id: string) {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }

  function editItem(id: string, newText: string) {
    const trimmedText = newText.trim();
    if (!trimmedText) return;

    const itemExists = shoppingList.some(
      (item) =>
        item.id !== id && item.text.toLowerCase() === trimmedText.toLowerCase(),
    );

    if (itemExists) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (toastFadeTimeoutRef.current)
        clearTimeout(toastFadeTimeoutRef.current);

      setDuplicateMessage(`"${trimmedText}" is already in your list`);
      setToastFading(false);
      toastTimeoutRef.current = setTimeout(() => {
        setToastFading(true);
        toastFadeTimeoutRef.current = setTimeout(
          () => setDuplicateMessage(""),
          500,
        );
      }, 2500);
      return;
    }

    dispatch({ type: "EDIT_ITEM", payload: { id, text: trimmedText } });
  }

  function sortShoppingList() {
    dispatch({ type: "SORT_LIST", payload: sortOrder });
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  function checkUncheckAllItems() {
    dispatch({ type: "TOGGLE_ALL", payload: allCompleted });
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

      <FilterForm
        filterText={filterText}
        setFilterText={setFilterText}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
      />

      <ShoppingList
        shoppingList={filteredList}
        toggleItem={toggleItem}
        removeItem={removeItem}
        editItem={editItem}
        formatDate={formatDate}
      />

      {duplicateMessage && (
        <div className={`toast${toastFading ? " fading" : ""}`}>
          {duplicateMessage}
        </div>
      )}
    </div>
  );
}

export default App;
