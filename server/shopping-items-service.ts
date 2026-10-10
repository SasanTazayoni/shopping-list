import { getItem, updateItem } from "./db.js";
import { ValidationError, ItemNotFoundError } from "./errors.js";

const isDefined = (value: any): boolean => value !== undefined;

const isNonEmptyString = (value: any): boolean => typeof value === "string" && value.trim() !== "";

const isPositiveInteger = (value: any): boolean => Number.isInteger(value) && value > 0;

const isBoolean = (value: any): boolean => typeof value === "boolean";

const validateShoppingItem = ({ text, quantity, completed }: { text?: any; quantity?: any; completed?: any }): string | null => {
    if (isDefined(text) && !isNonEmptyString(text)) {
        throw new ValidationError("text must be a non-empty string");
    } else if (isDefined(quantity) && !isPositiveInteger(quantity)) {
        throw new ValidationError("quantity must be a positive integer");
    } else if (isDefined(completed) && !isBoolean(completed)) {
        throw new ValidationError("completed must be true or false");
    }
    return null;
};

const updateShoppingItem = async ({ id, text, quantity, completed }) => {
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

    const result = await updateItem(text ?? item.text, quantity ?? item.quantity, completed ?? item.completed, completed_at, id);
    return result.rows[0];
};

export { updateShoppingItem };