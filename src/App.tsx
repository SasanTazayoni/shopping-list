import { useState } from "react";

function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  function addListItem(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && itemToAdd.trim() !== "") {
      setShoppingList((prev) => [...prev, itemToAdd]);
      setItemToAdd("");
    }
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
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
