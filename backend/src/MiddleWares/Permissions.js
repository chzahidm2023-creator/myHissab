const TeamMember = require("../../src/ScheemaModals/Administrations/userModal");

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const user = await TeamMember.findById(req.userId)
        .select("isActive assignedRoles individualPermissions")
        .populate({
          path: "assignedRoles",
          select: "permissions isActive",
        });

      if (!user || !user.isActive) {
        return res.status(403).json({
          success: false,
          message: "User is inactive or not found.",
        });
      }

      const rolePermissions = (user.assignedRoles || [])
        .filter((role) => role && role.isActive)
        .flatMap((role) => role.permissions || []);

      const allPermissions = [
        ...rolePermissions,
        ...(user.individualPermissions || []),
      ];

      const requiredPermission = `${module}.${action}`;

      console.log("Logged-in User ID:", req.userId);
      console.log("Required Permission:", requiredPermission);
      console.log("All Permissions:", allPermissions);
      console.log(
        "Permission Match:",
        allPermissions.includes(requiredPermission),
      );

      if (!allPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
        });
      }

      next();
    } catch (error) {
      console.log("Permission Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

module.exports = { checkPermission };
