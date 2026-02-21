const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*"
}));

/* body parser */
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

/* routes */
const authRoutes = require("./routes/auth");
const annotationRoutes = require("./routes/annotations");
const imageRoutes = require("./routes/images");

app.use("/api/auth", authRoutes);
app.use("/api/annotations", annotationRoutes);
app.use("/api/images", imageRoutes);

/* test route */
app.get("/", (req, res) => {
  res.send("API running");
});

/* IMPORTANT for Render */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});