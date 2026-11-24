const express = require("express");
const expCategoryRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { dateFilter } = require("../MiddleWares/dateFilter");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../Controllers/expenseCategoryController");

expCategoryRouter.post(
  "/add-category",
  protect,
  checkPermission("expenseCategories", "add"),
  activityLogger("Create", "Expense Category"),
  createCategory,
);

expCategoryRouter.get(
  "/list",
  protect,
  checkPermission("expenseCategories", "view"),
  dateFilter("createdAt"),
  getAllCategories,
);

expCategoryRouter.put(
  "/update-category/:id",
  protect,
  checkPermission("expenseCategories", "edit"),
  activityLogger("Update", "Expense Category"),
  updateCategory,
);

expCategoryRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("expenseCategories", "delete"),
  activityLogger("Delete", "Expense Category"),
  deleteCategory,
);

expCategoryRouter.get(
  "/:id",
  protect,
  checkPermission("expenseCategories", "view"),
  getCategoryById,
);

module.exports = { expCategoryRouter };
