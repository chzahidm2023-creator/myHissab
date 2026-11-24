const express = require("express");
const userRouter = express.Router();
const activityLogger = require("../MiddleWares/activityLogger");
const { dateFilter } = require("../MiddleWares/dateFilter");
const {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  login,
} = require("../Controllers/userController");

const protect = require("../MiddleWares/Autherization");
const { checkPermission } = require("../Middlewares/Permissions");
userRouter.post("/login", activityLogger("Login", "Authentication"), login);

userRouter.post(
  "/add",
  protect,
  checkPermission("users", "add"),
  activityLogger("Create", "User"),
  createTeamMember,
);

userRouter.get(
  "/list",
  protect,
  checkPermission("users", "view"),
  dateFilter("createdAt"),
  getAllTeamMembers,
);

userRouter.get(
  "/:id",
  protect,
  checkPermission("users", "view"),
  getTeamMemberById,
);

userRouter.put(
  "/:id",
  protect,
  checkPermission("users", "edit"),
  activityLogger("Update", "User"),
  updateTeamMember,
);

userRouter.delete(
  "/:id",
  protect,
  checkPermission("users", "delete"),
  activityLogger("Delete", "User"),
  deleteTeamMember,
);

module.exports = { userRouter };
