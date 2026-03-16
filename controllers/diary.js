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
    const diaries = await Diary.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(diaries);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/:diaryId", verifyToken, async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.diaryId).populate([
      "author",
      "comments.author",
    ]);

    res.status(200).json(diary);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:diaryId", verifyToken, async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.diaryId);

    if (!diary.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const updatedDiary = await Diary.findByIdAndUpdate(
      req.params.diaryId,
      req.body,
      { new: true },
    );

    updatedDiary._doc.author = req.user;

    res.status(200).json(updatedDiary);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:diaryId", verifyToken, async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.diaryId);

    if (!diary.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    await diary.deleteOne();

    res.status(200).json(diary);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/:diaryId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const diary = await Diary.findById(req.params.diaryId);
    diary.comments.push(req.body);
    await diary.save();

    const newComment = diary.comments[diary.comments.length - 1];
    newComment._doc.author = req.user;

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:diaryId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const diary = await Diary.findById(req.params.diaryId);
    const comment = diary.comments.id(req.params.commentId);

    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }

    comment.text = req.body.text;
    await diary.save();
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete(
  "/:diaryId/comments/:commentId",
  verifyToken,
  async (req, res) => {
    try {
      const diary = await Diary.findById(req.params.diaryId);
      const comment = diary.comments.id(req.params.commentId);

      // ensures the current user is the author of the comment
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to edit this comment" });
      }

      diary.comments.remove({ _id: req.params.commentId });
      await diary.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  },
);

module.exports = router;
