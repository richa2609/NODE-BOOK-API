require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Folio Bookstore API" }));
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.use(bookRoutes);

app.use((_req, res) => res.status(404).json({ message: "That endpoint doesn't exist." }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "MulterError" || err.message?.startsWith("Cover must")) {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) return res.status(409).json({ message: "That ISBN is already in your library." });
  res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Unexpected server error." : err.message });
});

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`Folio is ready at http://localhost:${PORT}`)))
    .catch((error) => {
      console.error("Startup failed:", error.message);
      process.exit(1);
    });
}

module.exports = app;
