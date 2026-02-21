const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* 🔥 VERY IMPORTANT: allow large images */
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

app.use(cors());

/* routes */
const authRoutes = require("./routes/auth");
const annotationRoutes = require("./routes/annotations");
const imageRoutes = require("./routes/images");

app.use("/api/auth", authRoutes);
app.use("/api/annotations", annotationRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});