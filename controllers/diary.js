const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Diary = require("../models/diary.js");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const diary = await Diary.create(req.body);
    diary._doc.author = req.user;
    res.status(201).json(diary);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const diarys = await Diary.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(diarys);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
