import { useEffect, useReducer, useRef, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./components/ShoppingList";
import Controls from "./components/Controls";
import ToggleAll from "./components/ToggleAll";
import { toggleAllItems } from "./utils/shoppingListLogic";
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


export type ShoppingListAction =
  | { type: "LOAD_ITEMS"; payload: TodoItem[] }
  | { type: "ADD_ITEM"; payload: { id: string; text: string; quantity: number; createdAt: Date } }
  | { type: "REMOVE_ITEM"; payload: string }
  | {
      type: "EDIT_ITEM";
      payload: { id: string; text: string; quantity: number };
    }
  | { type: "TOGGLE_ITEM"; payload: { id: string; completed: boolean; completedAt: Date | null } }
  | { type: "TOGGLE_ALL"; payload: boolean };

export function shoppingListReducer(
  state: TodoItem[],
  action: ShoppingListAction,
): TodoItem[] {
  switch (action.type) {
    case "LOAD_ITEMS":
      return action.payload;

    case "ADD_ITEM":
      return [
        ...state,
        {
          id: action.payload.id,
          text: action.payload.text.trim(),
          quantity: Math.max(1, Math.floor(action.payload.quantity)),
          completed: false,
          createdAt: action.payload.createdAt,
          completedAt: null,
        },
      ];

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "TOGGLE_ITEM":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, completed: action.payload.completed, completedAt: action.payload.completedAt }
          : item
      );

    case "TOGGLE_ALL":
      return toggleAllItems(state, action.payload, new Date());

    case "EDIT_ITEM":
      return state.map((item) =>
        item.id === action.payload.id
          ? {
              ...item,
              text: action.payload.text,
              quantity: action.payload.quantity,
            }
          : item,
      );

    default:
      return state;
  }
}

function App() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shoppingList, dispatch] = useReducer(shoppingListReducer, []);
  const [filterText, setFilterText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  useEffect(() => {
    fetch("/api/shopping-items")
      .then((res) => res.json())
      .then((data: Array<{ id: string; text: string; quantity: number; completed: boolean; createdAt: string; completedAt: string | null }>) => {
        dispatch({
          type: "LOAD_ITEMS",
          payload: data.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
          })),
        });
      })
      .catch((err) => console.error("Failed to load items:", err));
  }, []);

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

    const quantity = quantityRef.current!.valueAsNumber;

    const itemExists = shoppingList.some(
      (item) => item.text.toLowerCase() === value.toLowerCase(),
    );

    if (itemExists) {
      toast.show(`"${value}" is already in your list`);
      return;
    }

    fetch("/api/shopping-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value, quantity }),
    })
      .then((res) => res.json())
      .then((newItem) => {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: newItem.id,
            text: newItem.text,
            quantity: newItem.quantity,
            createdAt: new Date(newItem.createdAt),
          },
        });
      })
      .catch((err) => console.error("Failed to add item:", err));

    setNewItemText("");

    quantityRef.current!.value = "";
  }

  function addListItemKeyboard(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addListItem();
    }
  }

  function toggleItem(id: string) {
    const item = shoppingList.find((listItem) => listItem.id === id);
    if (!item) return;

    fetch(`/api/shopping-items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    })
      .then((res) => res.json())
      .then((updated) => {
        dispatch({
          type: "TOGGLE_ITEM",
          payload: {
            id,
            completed: updated.completed,
            completedAt: updated.completedAt ? new Date(updated.completedAt) : null,
          },
        });
      })
      .catch((err) => console.error("Failed to toggle item:", err));
  }

  function removeItem(id: string) {
    fetch(`/api/shopping-items/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        dispatch({ type: "REMOVE_ITEM", payload: id });
      })
      .catch((err) => console.error("Failed to delete item:", err));
  }

  function editItem(id: string, newText: string, quantity: number) {
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

    fetch(`/api/shopping-items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmedText, quantity }),
    })
      .then(() => {
        dispatch({
          type: "EDIT_ITEM",
          payload: { id, text: trimmedText, quantity },
        });
      })
      .catch((err) => console.error("Failed to edit item:", err));
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
