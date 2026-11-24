const express = require("express");
const customerRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { dateFilter } = require("../MiddleWares/dateFilter");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../Controllers/customerController");

customerRouter.post(
  "/add-customer",
  protect,
  checkPermission("customers", "add"),
  activityLogger("Create", "Customer"),
  createCustomer,
);

customerRouter.get(
  "/list",
  protect,
  checkPermission("customers", "view"),
  dateFilter("createdAt"),
  getAllCustomers,
);

customerRouter.get(
  "/:id",
  protect,
  checkPermission("customers", "view"),
  getCustomerById,
);

customerRouter.put(
  "/update-customer/:id",
  protect,
  checkPermission("customers", "edit"),
  activityLogger("Update", "Customer"),
  updateCustomer,
);

customerRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("customers", "delete"),
  activityLogger("Delete", "Customer"),
  deleteCustomer,
);

module.exports = { customerRouter };
