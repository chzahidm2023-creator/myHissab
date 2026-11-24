const mongoose = require("mongoose");
const Category = require("../ScheemaModals/categoryModal");

// Helper: Find by MongoDB _id or CategoryID
const findCategory = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Category.findById(id);
  }

  return Category.findOne({ CategoryID: id });
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
    const category = await Category.create({
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
    const { page, limit } = req.pagination;

    const filter = { ...req.dateQuery };
    const status = String(req.query.status || "all").toLowerCase();

    if (status === "active" || status === "true") {
      filter.isActive = true;
    } else if (status === "inactive" || status === "false") {
      filter.isActive = false;
    }

    const query = Category.find(filter).sort({ createdAt: -1 });

    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [categories, total] = await Promise.all([
      query,
      Category.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: limit === "all" ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
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
        message: "Category name or CategoryID already exists",
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

    await Category.deleteOne({ _id: category._id });

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
