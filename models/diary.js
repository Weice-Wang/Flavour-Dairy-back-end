const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const diarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
      enum: ["Bakery", "Bar", "Brunch", "Cafe", "Fast Food", "Fine Dining"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [commentSchema],
  },
  { timestamps: true },
);

const Diary = mongoose.model("Diary", diarySchema);

module.exports = Diary;
