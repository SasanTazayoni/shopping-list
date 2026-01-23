type ToggleAllProps = {
  checked: boolean;
  onToggle: () => void;
};

export default function ToggleAll({ checked, onToggle }: ToggleAllProps) {
  return (
    <label className="toggle-all">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      Check/Uncheck all
    </label>
  );
}
