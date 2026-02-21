import React, { useState } from "react";

function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    const res = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.message || "Login failed");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
  
      /* 🟢 SUCCESS */
      if (res.ok && data.id) {
        alert("✅ User created successfully! Please login.");
  
        // switch to login view
        setIsRegister(false);
  
        // clear inputs
        setUsername("");
        setPassword("");
        return;
      }
  
      /* 🔴 USER EXISTS */
      if (data.message) {
        alert(data.message);
        return;
      }
  
      alert("Registration failed");
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        {/* LEFT FORM */}
        <div style={left}>
          <h1 style={{ color: "white" }}>
            {isRegister ? "Create Account" : "Welcome back"}
          </h1>

          <p style={{ color: "#9ca3af", marginBottom: 30 }}>
            {isRegister
              ? "Create your account to continue"
              : "Login to continue to dashboard"}
          </p>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={input}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          {isRegister ? (
            <button onClick={handleRegister} style={btn}>
              Sign Up
            </button>
          ) : (
            <button onClick={handleLogin} style={btn}>
              Sign In
            </button>
          )}

          <p style={{ color: "#9ca3af", marginTop: 20 }}>
            {isRegister ? "Already have account?" : "New user?"}{" "}
            <span
              style={link}
              onClick={() => {
                setIsRegister(!isRegister);
                setUsername("");
                setPassword("");
              }}
            >
              {isRegister ? "Login" : "Create account"}
            </span>
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div style={right}>
          Welcome to VECROS!
          
        </div>
        
      </div>
      
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#0f172a,#020617)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter"
};

const card = {
  width: 900,
  height: 520,
  display: "flex",
  borderRadius: 20,
  overflow: "hidden",
  background: "#111827",
  boxShadow: "0 20px 80px rgba(0,0,0,0.6)"
};

const left = {
  flex: 1,
  padding: 60,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "stretch"
};

const right = {
  flex: 1,
  background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontSize: 28,
  fontWeight: "bold"
};

const input = {
  width: "100%",
  padding: "16px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #374151",
  background: "#020617",
  color: "white",
  boxSizing: "border-box"
};

const btn = {
  width: "100%",
  padding: "16px",
  marginTop: "8px",
  background: "#22d3ee",
  border: "none",
  borderRadius: "10px",
  fontWeight: 600,
  cursor: "pointer",
  display: "block"
};

const link = {
  color: "#22d3ee",
  cursor: "pointer",
  fontWeight: 600
};

export default Login;