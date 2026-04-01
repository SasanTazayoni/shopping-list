export type TodoItem = {
  id: string;
  text: string;
  quantity: number;
  completed: boolean;
  createdAt: Date;
  completedAt: Date | null;
};

export type ShoppingListAction =
  | { type: "LOAD_ITEMS"; payload: TodoItem[] }
  | {
      type: "ADD_ITEM";
      payload: { id: string; text: string; quantity: number; createdAt: Date };
    }
  | { type: "REMOVE_ITEM"; payload: string }
  | {
      type: "EDIT_ITEM";
      payload: { id: string; text: string; quantity: number };
    }
  | {
      type: "TOGGLE_ITEM";
      payload: { id: string; completed: boolean; completedAt: Date | null };
    }
  | {
      type: "TOGGLE_ALL";
      payload: { id: string; completed: boolean; completedAt: Date | null }[];
    };

export function shoppingListReducer(
  state: TodoItem[],
  action: ShoppingListAction,
): TodoItem[] {
  switch (action.type) {
    case "LOAD_ITEMS":
      return action.payload;

    case "ADD_ITEM":
      return [
        ...state,
        {
          id: action.payload.id,
          text: action.payload.text.trim(),
          quantity: Math.max(1, Math.floor(action.payload.quantity)),
          completed: false,
          createdAt: action.payload.createdAt,
          completedAt: null,
        },
      ];

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "TOGGLE_ITEM":
      return state.map((item) =>
        item.id === action.payload.id
          ? {
              ...item,
              completed: action.payload.completed,
              completedAt: action.payload.completedAt,
            }
          : item,
      );

    case "TOGGLE_ALL":
      return state.map((item) => {
        const match = action.payload.find(
          (updatedItem) => updatedItem.id === item.id,
        );
        return match
          ? {
              ...item,
              completed: match.completed,
              completedAt: match.completedAt,
            }
          : item;
      });

    case "EDIT_ITEM":
      return state.map((item) =>
        item.id === action.payload.id
          ? {
              ...item,
              text: action.payload.text,
              quantity: action.payload.quantity,
            }
          : item,
      );

    default:
      return state;
  }
}
