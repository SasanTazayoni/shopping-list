type ToggleAllProps = {
  checked: boolean;
  onToggle: () => void;
  isPending: boolean;
};

export default function ToggleAll({ checked, onToggle, isPending }: ToggleAllProps) {
  return (
    <label className="toggle-all">
      <input type="checkbox" checked={checked} onChange={onToggle} disabled={isPending} />
      Check/Uncheck all
    </label>
  );
}
