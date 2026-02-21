import React from "react";

function Dashboard({ goCanvas, logout }) {
  return (
    <div style={page}>
      {/* NAVBAR */}
      <div style={navbar}>
        <h2 style={{ color: "white" }}>Image Annotation Tool</h2>

        <button onClick={logout} style={logoutBtn}>
          Logout
        </button>
      </div>

      {/* CONTENT */}
      <div style={content}>
        <div style={card}>
          <h1 style={{ color: "white", marginBottom: 10 }}>
            Welcome 👋
          </h1>

          <p style={{ color: "#9ca3af", marginBottom: 30 }}>
            Start testing your annotation tool
          </p>

          <button style={mainBtn} onClick={goCanvas}>
            Test your annotation tool
          </button>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const page = {
  minHeight: "100vh",
  background: "#020617",
  fontFamily: "Inter"
};

const navbar = {
  height: 70,
  background: "#020617",
  borderBottom: "1px solid #111",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 40px"
};

const content = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh"
};

const card = {
  width: 420,
  padding: 40,
  borderRadius: 20,
  background: "#111827",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  textAlign: "center"
};

const mainBtn = {
  width: "100%",
  padding: 16,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#22d3ee,#6366f1)",
  color: "white",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer"
};

const logoutBtn = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#ef4444",
  color: "white",
  cursor: "pointer"
};

export default Dashboard;