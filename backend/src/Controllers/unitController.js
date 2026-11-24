const mongoose = require("mongoose");
const Unit = require("../ScheemaModals/unitModal");

// Helper: Find by MongoDB _id or CategoryID
const findUnit = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Unit.findById(id);
  }

  return Unit.findOne({ unitID: id });
};
const createUnits = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Unit name is required",
      });
    }
    const unit = await Unit.create({
      name,
      description,
      isActive,
    });
    return res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUnits = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const { page, limit } = req.pagination;
    const filter = { ...req.dateQuery };
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { brandID: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
      ];
    }
    if (status === "active" || status === "true") {
      filter.isActive = true;
    } else if (status === "inactive" || status === "false") {
      filter.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Status must be active, inactive, or all",
      });
    }
    const query = Unit.find(filter).sort({ createdAt: -1, _id: -1 });
    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }
    const [totalUnits, units] = await Promise.all([
      Unit.countDocuments(filter),
      query,
    ]);
    const totalPages = limit === "all" ? 1 : Math.ceil(totalUnits / limit);
    return res.status(200).json({
      success: true,
      pagination: {
        totalUnits,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      count: units.length,
      data: units,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUnitById = async (req, res) => {
  try {
    const units = await findUnit(req.params.id);

    if (!units) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateUnit = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const units = await findUnit(req.params.id);

    if (!units) {
      return res.status(404).json({
        success: false,
        message: "Unit not found",
      });
    }

    Object.assign(units, updates);
    await units.save();

    return res.status(200).json({
      success: true,
      message: "Unit updated successfully",
      data: units,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Unit, name or brandID already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const unit = await findUnit(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "unit not found",
      });
    }

    await Unit.deleteOne({ _id: unit._id });
    return res.status(200).json({
      success: true,
      message: "unit deleted successfully",
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUnits,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};
