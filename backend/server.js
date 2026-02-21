const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(
  cors({
    origin: "https://annotation-project.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");
const annotationRoutes = require("./routes/annotations");
const imageRoutes = require("./routes/images");

app.use("/auth", authRoutes);
app.use("/annotations", annotationRoutes);
app.use("/images", imageRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});