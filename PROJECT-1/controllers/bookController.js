const Book = require("../models/Book");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const imagePath = (req) => req.file ? `/uploads/${req.file.filename}` : undefined;

async function listBooks(req, res) {
  const { q, genre, author, minPrice, maxPrice, sort = "newest" } = req.query;
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const filter = {};

  if (q) {
    const safe = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ title: safe }, { author: safe }, { genre: safe }, { isbn: safe }];
  }
  if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, "i");
  if (author) filter.author = new RegExp(escapeRegex(author), "i");
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 }, oldest: { createdAt: 1 },
    "price-low": { price: 1 }, "price-high": { price: -1 }, title: { title: 1 }
  };
  const [total, books] = await Promise.all([
    Book.countDocuments(filter),
    Book.find(filter).sort(sortMap[sort]).skip((page - 1) * limit).limit(limit).lean()
  ]);

  res.json({ total, page, limit, pages: Math.ceil(total / limit), books });
}

async function getBook(req, res) {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "We couldn't find that book." });
  res.json(book);
}

async function createBook(req, res) {
  const data = { ...req.body };
  if (imagePath(req)) data.coverImage = imagePath(req);
  const book = await Book.create(data);
  res.status(201).json({ message: "Book added to your library.", book });
}

async function updateBook(req, res) {
  const data = { ...req.body };
  if (imagePath(req)) data.coverImage = imagePath(req);
  const book = await Book.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true
  });
  if (!book) return res.status(404).json({ message: "We couldn't find that book." });
  res.json({ message: "Book details updated.", book });
}

async function deleteBook(req, res) {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: "We couldn't find that book." });
  res.json({ message: "Book removed from your library." });
}

async function buyBook(req, res) {
  const quantity = Number(req.body.quantity || 1);
  // Atomic conditional update prevents two simultaneous purchases overselling stock.
  const book = await Book.findOneAndUpdate(
    { _id: req.params.id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );
  if (!book) {
    const exists = await Book.exists({ _id: req.params.id });
    return res.status(exists ? 409 : 404).json({
      message: exists ? "Not enough copies are available." : "We couldn't find that book."
    });
  }
  res.json({
    message: `Purchase recorded: ${quantity} × ${book.title}`,
    quantity, unitPrice: book.price, total: Number((quantity * book.price).toFixed(2)), book
  });
}

async function getOverview(_req, res) {
  const [totalTitles, stockResult, valueResult, genres] = await Promise.all([
    Book.countDocuments(),
    Book.aggregate([{ $group: { _id: null, copies: { $sum: "$stock" } } }]),
    Book.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ["$price", "$stock"] } } } }]),
    Book.distinct("genre")
  ]);
  res.json({
    totalTitles,
    totalCopies: stockResult[0]?.copies || 0,
    inventoryValue: Number((valueResult[0]?.value || 0).toFixed(2)),
    genreCount: genres.length
  });
}

async function getGenres(_req, res) {
  const genres = await Book.distinct("genre");
  res.json(genres.filter(Boolean).sort((a, b) => a.localeCompare(b)));
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook, buyBook, getOverview, getGenres };
