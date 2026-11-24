const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TeamMember = require("../ScheemaModals/Administrations/userModal");
const Role = require("../ScheemaModals/Administrations/roleModal");
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

const validateRoles = async (assignedRoles) => {
  if (!Array.isArray(assignedRoles)) return false;

  if (!assignedRoles.every((id) => mongoose.isValidObjectId(id))) {
    return false;
  }

  const uniqueRoles = [...new Set(assignedRoles.map(String))];

  if (uniqueRoles.length !== assignedRoles.length) return false;

  const count = await Role.countDocuments({
    _id: { $in: uniqueRoles },
    isActive: true,
  });

  return count === uniqueRoles.length;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      isActive = true,
      assignedRoles = [],
      individualPermissions = [],
    } = req.body;

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingMember = await TeamMember.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    if (!validatePermissions(individualPermissions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid individual permissions",
      });
    }

    if (!(await validateRoles(assignedRoles))) {
      return res.status(400).json({
        success: false,
        message: "One or more assigned roles are invalid or inactive",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await TeamMember.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      assignedRoles,
      individualPermissions,
    });

    const data = await TeamMember.findById(member._id)
      .select("-password")
      .populate("assignedRoles", "name slug");

    return res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllTeamMembers = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const { page, limit } = req.pagination;

    const query = { ...req.dateQuery };

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ];
    }

    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;

    const total = await TeamMember.countDocuments(query);

    const members = await TeamMember.find(query)
      .select("-password")
      .populate("assignedRoles", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1 && page <= totalPages,
      },
      data: members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTeamMemberById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    const member = await TeamMember.findById(req.params.id)
      .select("-password")
      .populate("assignedRoles", "name slug description permissions isActive");

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      isActive,
      assignedRoles,
      individualPermissions,
    } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }
    if (
      String(req.userId) === String(member._id) &&
      (assignedRoles !== undefined ||
        individualPermissions !== undefined ||
        isActive !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot change your own roles, permissions or account status.",
      });
    }
    const normalizedUsername =
      username !== undefined ? username.trim().toLowerCase() : undefined;

    const normalizedEmail =
      email !== undefined ? email.trim().toLowerCase() : undefined;

    if (
      (normalizedUsername !== undefined && !normalizedUsername) ||
      (normalizedEmail !== undefined && !normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and email cannot be empty",
      });
    }

    if (normalizedUsername !== undefined || normalizedEmail !== undefined) {
      const conditions = [];

      if (normalizedUsername !== undefined) {
        conditions.push({ username: normalizedUsername });
      }

      if (normalizedEmail !== undefined) {
        conditions.push({ email: normalizedEmail });
      }

      const existingMember = await TeamMember.findOne({
        _id: { $ne: member._id },
        $or: conditions,
      });

      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: "Username or email already exists",
        });
      }
    }

    if (assignedRoles !== undefined) {
      if (!(await validateRoles(assignedRoles))) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned roles are invalid or inactive",
        });
      }

      member.assignedRoles = assignedRoles;
    }

    if (individualPermissions !== undefined) {
      if (!validatePermissions(individualPermissions)) {
        return res.status(400).json({
          success: false,
          message: "Invalid individual permissions",
        });
      }

      member.individualPermissions = individualPermissions;
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      member.name = name.trim();
    }

    if (normalizedUsername !== undefined) {
      member.username = normalizedUsername;
    }

    if (normalizedEmail !== undefined) {
      member.email = normalizedEmail;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be a boolean",
        });
      }
      member.isActive = isActive;
    }

    if (password !== undefined && password !== "") {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      member.password = await bcrypt.hash(password, 10);
    }

    await member.save();

    const updatedMember = await TeamMember.findById(member._id)
      .select("-password")
      .populate("assignedRoles", "name slug");

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
      });
    }

    const member = await TeamMember.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    await member.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, username, email, password } = req.body;

    const loginId = (identifier || username || email || "")
      .trim()
      .toLowerCase();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const user = await TeamMember.findOne({
      $or: [{ username: loginId }, { email: loginId }],
    })
      .select("+password")
      .populate({
        path: "assignedRoles",
        match: { isActive: true },
        select: "name slug description permissions isActive",
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact administrator.",
      });
    }

    const activeRoles = (user.assignedRoles || []).filter(Boolean);

    const rolePermissions = activeRoles.flatMap(
      (role) => role.permissions || [],
    );

    const allPermissions = [
      ...new Set([...rolePermissions, ...(user.individualPermissions || [])]),
    ];

    const permissionMap = {};

    allPermissions.forEach((permission) => {
      const [module, action] = permission.split(".");

      if (!module || !action) return;

      if (!permissionMap[module]) {
        permissionMap[module] = [];
      }

      if (!permissionMap[module].includes(action)) {
        permissionMap[module].push(action);
      }
    });

    const permissions = Object.entries(permissionMap).map(
      ([module, actions]) => ({
        module,
        actions,
      }),
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "2d",
    });

    req.userId = user._id;
    req.userName = user.name || user.username;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
        },
        roles: activeRoles.map((role) => ({
          id: role._id,
          name: role.name,
          slug: role.slug,
          description: role.description,
        })),
        permissions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to login. Please try again.",
      error: error.message,
    });
  }
};

module.exports = {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  login,
};
