import { useState } from "react";

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [shoppingList, setShoppingList] = useState<
    { text: string; completed: boolean }[]
  >([]);

  function addListItem(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && itemToAdd.trim() !== "") {
      setShoppingList((prev) => [
        ...prev,
        {
          text: itemToAdd,
          completed: false,
        },
      ]);
      setItemToAdd("");
    }
  }

  function toggleItem(indexToToggle: number) {
    setShoppingList((prev) =>
      prev.map((item, index) =>
        index === indexToToggle
          ? { ...item, completed: !item.completed }
          : item,
      ),
    );
  }

  return (
    <>
      <div>
        <h1>Shopping List</h1>
        <input
          type="text"
          value={itemToAdd}
          onChange={(e) => setItemToAdd(e.target.value)}
          onKeyDown={(e) => addListItem(e)}
        />

        <ul>
          {shoppingList.map((item, index) => (
            <li key={index}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(index)}
              />
              <span className={item.completed ? "completed" : ""}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
