type ControlsProps = {
  itemToAdd: string;
  setItemToAdd: (value: string) => void;
  addListItem: () => void;
  addListItemKeyboard: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sortShoppingList: () => void;
  sortOrder: "asc" | "desc";
};

export default function Controls({
  itemToAdd,
  setItemToAdd,
  addListItem,
  addListItemKeyboard,
  sortShoppingList,
  sortOrder,
}: ControlsProps) {
  return (
    <div className="controls">
      <input
        type="text"
        value={itemToAdd}
        onChange={(e) => setItemToAdd(e.target.value)}
        onKeyDown={addListItemKeyboard}
        placeholder="Add an item…"
      />
      <button onClick={addListItem}>✓</button>
      <button onClick={sortShoppingList}>
        {sortOrder === "asc" ? "A→Z" : "Z→A"}
      </button>
    </div>
  );
}
