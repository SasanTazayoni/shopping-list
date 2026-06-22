class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

class ItemNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ItemNotFoundError";
    }
}

export { ValidationError, ItemNotFoundError };