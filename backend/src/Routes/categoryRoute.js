const express = require("express");
const categoryRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const { dateFilter } = require("../MiddleWares/dateFilter");
const activityLogger = require("../MiddleWares/activityLogger");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/categoryController");

categoryRouter.post(
  "/add-category",
  protect,
  checkPermission("categories", "add"),
  activityLogger("categories", "Created", "New category created"),
  createCategory,
);

categoryRouter.get(
  "/list",
  protect,
  checkPermission("categories", "view"),
  dateFilter("createdAt"),
  getAllCategories,
);

categoryRouter.put(
  "/update-category/:id",
  protect,
  checkPermission("categories", "edit"),
  activityLogger("categories", "Updated", "Category updated"),
  updateCategory,
);

categoryRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("categories", "delete"),
  activityLogger("categories", "Deleted", "Category deleted"),
  deleteCategory,
);

categoryRouter.get(
  "/:id",
  protect,
  checkPermission("categories", "view"),
  getCategoryById,
);

module.exports = { categoryRouter };
