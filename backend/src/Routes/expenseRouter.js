const express = require("express");
const expenseRouter = express.Router();
const { upload } = require("../MiddleWares/Multer");
const { dateFilter } = require("../MiddleWares/dateFilter");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../Controllers/ExpenseController");

expenseRouter.post(
  "/add",
  protect,
  checkPermission("expenses", "add"),
  upload.single("attachment"),
  activityLogger("Create", "Expense"),
  createExpense,
);

expenseRouter.get(
  "/list",
  protect,
  checkPermission("expenses", "view"),
  dateFilter("createdAt"),
  getAllExpenses,
);

expenseRouter.get(
  "/:id",
  protect,
  checkPermission("expenses", "view"),
  getExpenseById,
);

expenseRouter.put(
  "/update/:id",
  protect,
  checkPermission("expenses", "edit"),
  upload.single("attachment"),
  activityLogger("Update", "Expense"),
  updateExpense,
);

expenseRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("expenses", "delete"),
  activityLogger("Delete", "Expense"),
  deleteExpense,
);

module.exports = { expenseRouter };
