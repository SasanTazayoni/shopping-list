type ControlsProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  quantityRef: React.RefObject<HTMLInputElement | null>;
  newItemText: string;
  setNewItemText: React.Dispatch<React.SetStateAction<string>>;
  addListItem: () => void;
  addListItemKeyboard: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sortShoppingList: () => void;
  sortOrder: "asc" | "desc";
};

export default function Controls({
  inputRef,
  quantityRef,
  newItemText,
  setNewItemText,
  addListItem,
  addListItemKeyboard,
  sortShoppingList,
  sortOrder,
}: ControlsProps) {
  return (
    <div className="controls">
      <input
        ref={inputRef}
        type="text"
        value={newItemText}
        onChange={(e) => setNewItemText(e.target.value)}
        onKeyDown={addListItemKeyboard}
        placeholder="Add an item..."
      />
      <input
        className="quantity-input"
        ref={quantityRef}
        type="number"
        min={1}
        step={1}
        aria-label="Quantity"
        disabled={newItemText.trim() === ""}
        onInput={(e) => {
          const input = e.currentTarget;
          if (input.valueAsNumber < 1) input.value = "1";
        }}
      />

      <button onClick={addListItem} disabled={newItemText.trim() === ""}>
        ✓
      </button>
      <button onClick={sortShoppingList}>
        {sortOrder === "asc" ? "A→Z" : "Z→A"}
      </button>
    </div>
  );
}
