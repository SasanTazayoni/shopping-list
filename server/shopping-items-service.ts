import { getItem, updateItem } from "./db.js";
import { ValidationError, ItemNotFoundError } from "./errors.js";

const isDefined = (value: unknown): boolean => value !== undefined;
const isNonEmptyString = (value: unknown): boolean =>
  typeof value === "string" && value.trim() !== "";
const isPositiveInteger = (value: unknown): boolean =>
  Number.isInteger(value) && (value as number) > 0;
const isBoolean = (value: unknown): boolean => typeof value === "boolean";

const validateShoppingItem = ({
  text,
  quantity,
  completed,
}: {
  text?: unknown;
  quantity?: unknown;
  completed?: unknown;
}): string | null => {
  if (isDefined(text) && !isNonEmptyString(text)) {
    throw new ValidationError("text must be a non-empty string");
  } else if (isDefined(quantity) && !isPositiveInteger(quantity)) {
    throw new ValidationError("quantity must be a positive integer");
  } else if (isDefined(completed) && !isBoolean(completed)) {
    throw new ValidationError("completed must be true or false");
  }
  return null;
};

const updateShoppingItem = async ({
  id,
  text,
  quantity,
  completed,
}: {
  id: string;
  text?: string;
  quantity?: number;
  completed?: boolean;
}) => {
  validateShoppingItem({ text, quantity, completed });

  const existingItem = await getItem(id);
  if (existingItem.rows.length === 0) {
    throw new ItemNotFoundError("Item not found");
  }

  const item = existingItem.rows[0];
  let completed_at = item.completed_at;

  if (completed !== undefined && completed !== item.completed) {
    completed_at = completed ? new Date().toISOString() : null;
  }

  const result = await updateItem(
    text ?? item.text,
    quantity ?? item.quantity,
    completed ?? item.completed,
    completed_at,
    id,
  );
  return result.rows[0];
};

export { updateShoppingItem };
