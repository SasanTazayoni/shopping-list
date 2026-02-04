import type { TodoItem } from "../App";

export function toggleItemById(
  items: TodoItem[],
  idToToggle: string,
  now: Date,
): TodoItem[] {
  return items.map((item) => {
    if (item.id !== idToToggle) return item;

    const willBeCompleted = !item.completed;

    return {
      ...item,
      completed: willBeCompleted,
      completedAt: willBeCompleted ? now : null,
    };
  });
}

export function toggleAllItems(
  items: TodoItem[],
  allCompleted: boolean,
  now: Date,
): TodoItem[] {
  return items.map((item) => {
    if (allCompleted) {
      return { ...item, completed: false, completedAt: null };
    }

    if (item.completed) {
      return item;
    }

    return { ...item, completed: true, completedAt: now };
  });
}
