// src/App.jsx
import { useState } from "react";

import ChatDisplay from "./components/ChatDisplay";

const users = ["Gayatri ❤️♾️", "SNKT"]; // Example users

function App() {
  const [currentUser, setCurrentUser] = useState(users[0]);

  return (
    <div>
      <ChatDisplay
        currentUser="Gayatri ❤️♾️"
        users={["Gayatri ❤️♾️", "SNKT"]}
      />
    </div>
  );
}

export default App;
