const express = require("express");
const roleRouter = express.Router();
const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
const activityLogger = require("../MiddleWares/activityLogger");

const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../Controllers/roleController");

roleRouter.post(
  "/add",
  protect,
  checkPermission("roles", "add"),
  activityLogger("Create", "Role"),
  createRole,
);
roleRouter.get("/list", protect, checkPermission("roles", "view"), getAllRoles);
roleRouter.get("/:id", protect, checkPermission("roles", "view"), getRoleById);
roleRouter.put(
  "/:id",
  protect,
  checkPermission("roles", "edit"),
  activityLogger("Update", "Role"),
  updateRole,
);

roleRouter.delete(
  "/:id",
  protect,
  checkPermission("roles", "delete"),
  activityLogger("Delete", "Role"),
  deleteRole,
);

module.exports = { roleRouter };
