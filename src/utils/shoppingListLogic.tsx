import type { TodoItem } from "../App";

export function toggleItemAtIndex(
  items: TodoItem[],
  indexToToggle: number,
  now: Date,
): TodoItem[] {
  return items.map((item, index) => {
    if (index !== indexToToggle) return item;

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
