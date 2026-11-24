const mongoose = require("mongoose");
const Role = require("../ScheemaModals/Administrations/roleModal");
const TeamMember = require("../ScheemaModals/Administrations/userModal");
const {
  ALL_PERMISSIONS,
} = require("../ScheemaModals/Administrations/permission");

const validatePermissions = (permissions) => {
  return (
    Array.isArray(permissions) &&
    permissions.every(
      (permission) =>
        typeof permission === "string" && ALL_PERMISSIONS.includes(permission),
    )
  );
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createRole = async (req, res) => {
  try {
    const { name, slug, description, permissions = [] } = req.body;

    if (!name?.trim() || !slug?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name and slug are required",
      });
    }

    if (!validatePermissions(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role permissions",
      });
    }

    const normalizedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();
    const existingRole = await Role.findOne({
      $or: [
        { name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" } },
        { slug: normalizedSlug },
      ],
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role name or slug already exists",
      });
    }

    const role = await Role.create({
      name: normalizedName,
      slug: normalizedSlug,
      description: description?.trim() || "",
      permissions: [...new Set(permissions)],
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Role name or slug already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      query.$or = [{ name: searchRegex }, { slug: searchRegex }];
    }

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const roles = await Role.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { name, slug, description, permissions, isActive } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const normalizedName = name !== undefined ? name.trim() : undefined;

    const normalizedSlug =
      slug !== undefined ? slug.trim().toLowerCase() : undefined;

    if (
      (normalizedName !== undefined && !normalizedName) ||
      (normalizedSlug !== undefined && !normalizedSlug)
    ) {
      return res.status(400).json({
        success: false,
        message: "Role name and slug cannot be empty",
      });
    }

    if (normalizedName !== undefined || normalizedSlug !== undefined) {
      const conditions = [];

      if (normalizedName !== undefined) {
        conditions.push({
          name: {
            $regex: `^${escapeRegex(normalizedName)}$`,
            $options: "i",
          },
        });
      }

      if (normalizedSlug !== undefined) {
        conditions.push({ slug: normalizedSlug });
      }

      const existingRole = await Role.findOne({
        _id: { $ne: role._id },
        $or: conditions,
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: "Role name or slug already exists",
        });
      }
    }

    if (permissions !== undefined) {
      if (!validatePermissions(permissions)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role permissions",
        });
      }

      role.permissions = [...new Set(permissions)];
    }

    if (normalizedName !== undefined) {
      role.name = normalizedName;
    }

    if (normalizedSlug !== undefined) {
      role.slug = normalizedSlug;
    }

    if (description !== undefined) {
      role.description = description.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean",
        });
      }

      role.isActive = isActive;
    }

    await role.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const assignedUsers = await TeamMember.countDocuments({
      assignedRoles: role._id,
    });

    if (assignedUsers > 0) {
      return res.status(409).json({
        success: false,
        message: "This role is assigned to users. Remove it from users first.",
        assignedUsers,
      });
    }

    await role.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
