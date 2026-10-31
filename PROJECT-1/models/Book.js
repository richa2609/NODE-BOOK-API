const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    isbn: { type: String, required: true, unique: true, trim: true, uppercase: true },
    genre: { type: String, default: "General", trim: true, maxlength: 60 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    coverImage: { type: String, default: "" }
  },
  { timestamps: true, versionKey: false }
);

bookSchema.index({ title: "text", author: "text", genre: "text" });
bookSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Book", bookSchema);
