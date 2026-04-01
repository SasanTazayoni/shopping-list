import { useEffect, useReducer, useRef, useState } from "react";
import "./css/styles.css";
import ShoppingList from "./components/ShoppingList";
import Controls from "./components/Controls";
import ToggleAll from "./components/ToggleAll";
import FilterForm from "./components/FilterForm";
import EmptyList from "./components/EmptyList";
import LoadError from "./components/LoadError";
import LoadingSpinner from "./components/LoadingSpinner";
import { useToast } from "./hooks/useToast";
import { shoppingListReducer } from "./reducers/shoppingListReducer";

function App() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [shoppingList, dispatch] = useReducer(shoppingListReducer, []);
  const [filterText, setFilterText] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const toast = useToast();

  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/shopping-items");
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`GET /api/shopping-items failed with status ${res.status}: ${body}`);
        }
        const data: Array<{
          id: string;
          text: string;
          quantity: number;
          completed: boolean;
          createdAt: string;
          completedAt: string | null;
        }> = await res.json();
        dispatch({
          type: "LOAD_ITEMS",
          payload: data.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
          })),
        });
      } catch (error) {
        toast.show("Failed to load items. Please try again.");
        console.error("Failed to load shopping list items:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
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

  async function addListItem() {
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

    setIsPending(true);
    try {
      const res = await fetch("/api/shopping-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value, quantity }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`POST /api/shopping-items failed with status ${res.status}: ${body}`);
      }
      const newItem = await res.json();
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: newItem.id,
          text: newItem.text,
          quantity: newItem.quantity,
          createdAt: new Date(newItem.createdAt),
        },
      });
    } catch (error) {
      toast.show("Failed to add item. Please try again.");
      console.error("Failed to add new item:", error);
    } finally {
      setIsPending(false);
    }

    setNewItemText("");
    quantityRef.current!.value = "";
  }

  function addListItemKeyboard(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      addListItem();
    }
  }

  async function toggleItem(id: string) {
    const item = shoppingList.find((listItem) => listItem.id === id)!;

    setIsPending(true);
    try {
      const res = await fetch(`/api/shopping-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`PUT /api/shopping-items/${id} failed with status ${res.status}: ${body}`);
      }
      const updated = await res.json();
      dispatch({
        type: "TOGGLE_ITEM",
        payload: {
          id,
          completed: updated.completed,
          completedAt: updated.completedAt
            ? new Date(updated.completedAt)
            : null,
        },
      });
    } catch (error) {
      toast.show("Failed to toggle item. Please try again.");
      console.error(`Failed to toggle item ${id}:`, error);
    } finally {
      setIsPending(false);
    }
  }

  async function removeItem(id: string) {
    setIsPending(true);
    try {
      const res = await fetch(`/api/shopping-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`DELETE /api/shopping-items/${id} failed with status ${res.status}: ${body}`);
      }
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } catch (error) {
      toast.show("Failed to delete item. Please try again.");
      console.error(`Failed to delete item ${id}:`, error);
    } finally {
      setIsPending(false);
    }
  }

  async function editItem(id: string, newText: string, quantity: number) {
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

    setIsPending(true);
    try {
      const res = await fetch(`/api/shopping-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmedText, quantity }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`PUT /api/shopping-items/${id} failed with status ${res.status}: ${body}`);
      }
      dispatch({
        type: "EDIT_ITEM",
        payload: { id, text: trimmedText, quantity },
      });
    } catch (error) {
      toast.show("Failed to edit item. Please try again.");
      console.error(`Failed to edit item ${id}:`, error);
    } finally {
      setIsPending(false);
    }
  }

  function sortShoppingList() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }

  async function checkUncheckAllItems() {
    if (shoppingList.length === 0) return;

    const newCompleted = !allCompleted;

    setIsPending(true);
    try {
      const updatedItems = await Promise.all(
        shoppingList.map((item) =>
          fetch(`/api/shopping-items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: newCompleted }),
          }).then(async (res) => {
            if (!res.ok) {
              const body = await res.text();
              throw new Error(`PUT /api/shopping-items/${item.id} failed with status ${res.status}: ${body}`);
            }
            return res.json();
          }),
        ),
      );
      dispatch({
        type: "TOGGLE_ALL",
        payload: updatedItems.map((updated) => ({
          id: updated.id,
          completed: updated.completed,
          completedAt: updated.completedAt
            ? new Date(updated.completedAt)
            : null,
        })),
      });
    } catch (error) {
      toast.show("Failed to toggle all items. Please try again.");
      console.error("Failed to toggle all items:", error);
    } finally {
      setIsPending(false);
    }
  }

  const allCompleted =
    shoppingList.length > 0 && shoppingList.every((item) => item.completed);

  function renderList() {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <LoadError />;
    if (shoppingList.length === 0) return <EmptyList />;
    return (
      <ShoppingList
        shoppingList={filteredList}
        toggleItem={toggleItem}
        removeItem={removeItem}
        editItem={editItem}
        isPending={isPending}
      />
    );
  }

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
        isPending={isPending}
      />

      <ToggleAll
        checked={allCompleted}
        onToggle={checkUncheckAllItems}
        isPending={isPending}
      />

      <FilterForm
        filterText={filterText}
        setFilterText={setFilterText}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
      />

      {renderList()}

      {toast.message && (
        <div className={`toast${toast.fading ? " fading" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
