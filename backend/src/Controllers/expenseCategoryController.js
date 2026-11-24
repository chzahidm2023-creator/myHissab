const mongoose = require("mongoose");
const ExpenseCategory = require("../ScheemaModals/expenseCategoryModal");

// Helper: Find by MongoDB _id or   expenseCategoryID
const findCategory = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return ExpenseCategory.findById(id);
  }

  return ExpenseCategory.findOne({ expenseCategoryID: id });
};
const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    const category = await ExpenseCategory.create({
      name,
      description,
      isActive,
    });
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { search = "", status = "all" } = req.query;
    const { page, limit } = req.pagination;

    const filter = { ...(req.dateQuery || {}) };

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { expenseCategoryID: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Status must be active, inactive, or all",
      });
    }

    const query = ExpenseCategory.find(filter).sort({
      createdAt: -1,
      _id: -1,
    });

    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [categories, totalCategories] = await Promise.all([
      query,
      ExpenseCategory.countDocuments(filter),
    ]);

    const totalPages = limit === "all" ? 1 : Math.ceil(totalCategories / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalCategories,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await findCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateCategory = async (req, res) => {
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

    const category = await findCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    Object.assign(category, updates);
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category name or expenseCategoryID already exists",
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

const deleteCategory = async (req, res) => {
  try {
    const category = await findCategory(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await ExpenseCategory.deleteOne({ _id: category._id });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
