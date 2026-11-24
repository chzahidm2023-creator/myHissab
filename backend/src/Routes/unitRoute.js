const express = require("express");
const unitRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");
const { dateFilter } = require("../MiddleWares/dateFilter");
const {
  createUnits,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} = require("../Controllers/unitController");

unitRouter.post(
  "/add-unit",
  protect,
  checkPermission("units", "add"),
  activityLogger("Create", "Unit"),
  createUnits,
);

unitRouter.get(
  "/list",
  protect,
  checkPermission("units", "view"),
  dateFilter("createdAt"),
  getAllUnits,
);

unitRouter.get("/:id", protect, checkPermission("units", "view"), getUnitById);

unitRouter.put(
  "/update-unit/:id",
  protect,
  checkPermission("units", "edit"),
  activityLogger("Update", "Unit"),
  updateUnit,
);

unitRouter.delete(
  "/delete/:id",
  protect,
  checkPermission("units", "delete"),
  activityLogger("Delete", "Unit"),
  deleteUnit,
);

module.exports = { unitRouter };
