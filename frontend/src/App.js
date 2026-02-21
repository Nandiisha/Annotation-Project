import React, { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Canvas from "./Canvas";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard"); 
  // pages: login | dashboard | canvas

  if (!token) {
    return <Login setToken={setToken} />;
  }

  if (page === "canvas") {
    return <Canvas token={token} goDashboard={() => setPage("dashboard")} />;
  }

  return (
    <Dashboard
      goCanvas={() => setPage("canvas")}
      logout={() => {
        localStorage.removeItem("token");
        setToken(null);
      }}
    />
  );
}

export default App;