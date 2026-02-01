type ControlsProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  addListItem: () => void;
  addListItemKeyboard: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sortShoppingList: () => void;
  sortOrder: "asc" | "desc";
};

export default function Controls({
  inputRef,
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
        onKeyDown={addListItemKeyboard}
        placeholder="Add an item..."
      />
      <button onClick={addListItem}>✓</button>
      <button onClick={sortShoppingList}>
        {sortOrder === "asc" ? "A→Z" : "Z→A"}
      </button>
    </div>
  );
}
