import type { TodoItem } from "../App";

export function hasDuplicateItemText(
  items: TodoItem[],
  text: string,
  excludeId?: string,
) {
  const needle = text.trim().toLowerCase();
  return items.some(
    (item) =>
      item.text.toLowerCase() === needle &&
      (excludeId ? item.id !== excludeId : true),
  );
}
