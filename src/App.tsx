import { useEffect, useReducer, useRef, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./components/ShoppingList";
import Controls from "./components/Controls";
import ToggleAll from "./components/ToggleAll";
import { toggleAllItems, toggleItemById } from "./utils/shoppingListLogic";
import FilterForm from "./components/FilterForm";
import { useToast } from "./hooks/useToast";

export type TodoItem = {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

type StoredTodoItem = {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type ShoppingListAction =
  | { type: "ADD_ITEM"; payload: { text: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "EDIT_ITEM"; payload: { id: string; text: string } }
  | { type: "TOGGLE_ITEM"; payload: string }
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
          text: action.payload.text.trim(),
          quantity: Math.max(1, Math.floor(action.payload.quantity)),
          completed: false,
          createdAt: new Date(),
          completedAt: null,
        },
      ];

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "TOGGLE_ITEM":
      return toggleItemById(state, action.payload, new Date());

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
      quantity: item.quantity ?? 1,
      completed: item.completed,
      createdAt: new Date(item.createdAt),
      completedAt: item.completedAt ? new Date(item.completedAt) : null,
    }));
  });
  const [filterText, setFilterText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  useEffect(() => {
    const toStore: StoredTodoItem[] = shoppingList.map((item) => ({
      id: item.id,
      text: item.text,
      quantity: item.quantity,
      completed: item.completed,
      createdAt: item.createdAt.toISOString(),
      completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [shoppingList]);

  const filteredList = [...shoppingList]
    .filter((item) => {
      const matchesSearch = item.text
        .toLowerCase()
        .includes(filterText.toLowerCase());

      const passesCompletionFilter = !hideCompleted || !item.completed;

      return matchesSearch && passesCompletionFilter;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.text.localeCompare(b.text)
        : b.text.localeCompare(a.text),
    );

  function addListItem() {
    const value = newItemText.trim();
    if (!value) return;

    const quantity = quantityRef.current?.valueAsNumber ?? 1;

    const itemExists = shoppingList.some(
      (item) => item.text.toLowerCase() === value.toLowerCase(),
    );

    if (itemExists) {
      toast.show(`"${value}" is already in your list`);
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        text: value,
        quantity,
      },
    });

    setNewItemText("");

    if (quantityRef.current) quantityRef.current.value = "";
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
      toast.show(`"${trimmedText}" is already in your list`);
      return;
    }

    dispatch({ type: "EDIT_ITEM", payload: { id, text: trimmedText } });
  }

  function sortShoppingList() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  function checkUncheckAllItems() {
    dispatch({ type: "TOGGLE_ALL", payload: allCompleted });
  }

  const allCompleted =
    shoppingList.length > 0 && shoppingList.every((item) => item.completed);

  return (
    <div className="app">
      <h1>Shopping List</h1>

      <Controls
        inputRef={inputRef}
        quantityRef={quantityRef}
        newItemText={newItemText}
        setNewItemText={setNewItemText}
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
      />

      {toast.message && (
        <div className={`toast${toast.fading ? " fading" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
