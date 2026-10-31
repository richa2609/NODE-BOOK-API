const { body, param, query, validationResult } = require("express-validator");
const fs = require("fs");

const checkErrors = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      message: "Please check the highlighted fields.",
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  next();
};

const idRules = [param("id").isMongoId().withMessage("A valid book id is required"), checkErrors];

const listRules = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be 1 or higher"),
  query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
  query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be 0 or higher"),
  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be 0 or higher"),
  query("sort").optional().isIn(["newest", "oldest", "price-low", "price-high", "title"]).withMessage("Unsupported sort option"),
  checkErrors
];

const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 160 }),
  body("author").trim().notEmpty().withMessage("Author is required").isLength({ max: 120 }),
  body("isbn").trim().isISBN().withMessage("Enter a valid ISBN"),
  body("genre").optional().trim().notEmpty().withMessage("Genre cannot be empty"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is limited to 1000 characters"),
  body("price").notEmpty().bail().isFloat({ min: 0 }).withMessage("Price must be 0 or higher"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a whole number of 0 or more"),
  checkErrors
];

const updateRules = [
  ...idRules.slice(0, 1),
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
  body("author").optional().trim().notEmpty().withMessage("Author cannot be empty"),
  body("isbn").optional().trim().isISBN().withMessage("Enter a valid ISBN"),
  body("genre").optional().trim().notEmpty().withMessage("Genre cannot be empty"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description is limited to 1000 characters"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be 0 or higher"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a whole number of 0 or more"),
  checkErrors
];

const buyRules = [
  param("id").isMongoId().withMessage("A valid book id is required"),
  body("quantity").optional().isInt({ min: 1, max: 100 }).withMessage("Quantity must be between 1 and 100"),
  checkErrors
];

module.exports = { idRules, listRules, createRules, updateRules, buyRules };
