type FilterFormProps = {
  filterText: string;
  setFilterText: (text: string) => void;
  hideCompleted: boolean;
  setHideCompleted: (hide: boolean) => void;
};

export default function FilterForm({
  filterText,
  setFilterText,
  hideCompleted,
  setHideCompleted,
}: FilterFormProps) {
  return (
    <div className="filter-form">
      <input
        type="text"
        placeholder="Filter by name..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={hideCompleted}
          onChange={(e) => setHideCompleted(e.target.checked)}
        />
        Hide completed
      </label>
    </div>
  );
}
