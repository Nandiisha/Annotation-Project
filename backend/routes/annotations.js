const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

router.get("/:imageId", auth, async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await pool.query(
      "SELECT * FROM annotations WHERE user_id=$1 AND image_id=$2 ORDER BY id",
      [req.user.id, imageId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log("ANNOTATION FETCH ERROR:", err);
    res.status(500).send("Server error");
  }
});
router.post("/", auth, async (req, res) => {
  const {
    imageId,
    x, y, width, height,
    category, severity,
    findings, className,
    uniqueId
  } = req.body;

  const newAnnotation = await pool.query(
    `INSERT INTO annotations 
    (user_id, image_id, x, y, width, height, category, severity, findings, class_name, unique_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      req.user.id,
      imageId,
      x, y, width, height,
      category, severity,
      findings, className,
      uniqueId
    ]
  );

  res.json(newAnnotation.rows[0]);
});
// UPDATE ANNOTATION

router.put("/:id", auth, async (req, res) => {
  console.log("🔥 PUT ROUTE HIT", req.params.id);
  const id = Number(req.params.id);

  const {
    x, y, width, height,
    category,
    severity,
    findings,
    className,
    uniqueId
  } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE annotations SET
        x=$1,
        y=$2,
        width=$3,
        height=$4,
        category=$5,
        severity=$6,
        findings=$7,
        class_name=$8,
        unique_id=$9
      WHERE id=$10 AND user_id=$11
      RETURNING *`,
      [
        x, y, width, height,
        category,
        severity,
        findings,
        className,
        uniqueId,
        id,
        req.user.id
      ]
    );

    if (!updated.rows[0]) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});
module.exports = router;