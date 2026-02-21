const express = require("express");
console.log("IMAGES ROUTE LOADED");   // 👈 add this
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");


// ===== SAVE IMAGE =====
router.post("/", auth, async (req, res) => {
    try {
      const { imageData, imageName } = req.body;
  
      // 1️⃣ check if image already exists
      const existing = await pool.query(
        "SELECT * FROM images WHERE image_name=$1 AND user_id=$2",
        [imageName, req.user.id]
      );
  
      if (existing.rows.length > 0) {
        // return existing image instead of creating new
        return res.json(existing.rows[0]);
      }
  
      // 2️⃣ insert new
      const result = await pool.query(
        "INSERT INTO images (image_data, image_name, user_id) VALUES ($1,$2,$3) RETURNING *",
        [imageData, imageName, req.user.id]
      );
  
      res.json(result.rows[0]);
  
    } catch (err) {
      console.log("IMAGE POST ERROR:", err);
      res.status(500).send("Server error");
    }
  });


// ===== GET IMAGES =====
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM images WHERE user_id=$1 ORDER BY id DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.log("IMAGE GET ERROR:", err);
    res.status(500).send("Server error");
  }
});
// ===== DELETE IMAGE =====
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // delete annotations first
    await pool.query(
      "DELETE FROM annotations WHERE image_id=$1 AND user_id=$2",
      [id, req.user.id]
    );

    // delete image
    await pool.query(
      "DELETE FROM images WHERE id=$1 AND user_id=$2",
      [id, req.user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.log("IMAGE DELETE ERROR:", err);
    res.status(500).send("Server error");
  }
});
module.exports = router;