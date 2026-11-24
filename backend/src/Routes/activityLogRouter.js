const express = require("express");
const activityLogRouter = express.Router();
const { dateFilter } = require("../MiddleWares/dateFilter");
const { getAllActivityLogs } = require("../Controllers/acttivityController");
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../MiddleWares/Permissions");

activityLogRouter.get(
  "/list",
  protect,
  checkPermission("activityLogs", "view"),
  dateFilter("createdAt"),
  getAllActivityLogs,
);

module.exports = { activityLogRouter };
