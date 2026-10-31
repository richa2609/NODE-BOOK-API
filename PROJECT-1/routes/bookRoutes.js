const router = require("express").Router();
const upload = require("../middleware/upload");
const asyncHandler = require("../middleware/asyncHandler");
const { idRules, listRules, createRules, updateRules, buyRules } = require("../middleware/validate");
const controller = require("../controllers/bookController");

router.get("/api/overview", asyncHandler(controller.getOverview));
router.get("/api/genres", asyncHandler(controller.getGenres));
router.get("/api/books", listRules, asyncHandler(controller.listBooks));
router.get("/api/books/:id", idRules, asyncHandler(controller.getBook));
router.post("/api/books", upload.single("coverImage"), createRules, asyncHandler(controller.createBook));
router.put("/api/books/:id", upload.single("coverImage"), updateRules, asyncHandler(controller.updateBook));
router.patch("/api/books/:id", upload.single("coverImage"), updateRules, asyncHandler(controller.updateBook));
router.delete("/api/books/:id", idRules, asyncHandler(controller.deleteBook));
router.post("/api/books/:id/buy", buyRules, asyncHandler(controller.buyBook));

router.post("/addbook", upload.single("coverImage"), createRules, asyncHandler(controller.createBook));

module.exports = router;
