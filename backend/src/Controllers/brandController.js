const mongoose = require("mongoose");
const Brand = require("../ScheemaModals/brandModal");

// Helper: Find by MongoDB _id or CategoryID
const findCategory = (id) => {
  if (mongoose.isValidObjectId(id)) {
    return Brand.findById(id);
  }

  return Brand.findOne({ brandID: id });
};
const createBrand = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }
    const brand = await Brand.create({
      name,
      description,
      isActive,
    });
    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBrands = async (req, res) => {
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
        { brandID: searchRegex },
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

    const query = Brand.find(filter).sort({ createdAt: -1, _id: -1 });

    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [brands, totalBrands] = await Promise.all([
      query,
      Brand.countDocuments(filter),
    ]);

    const totalPages = limit === "all" ? 1 : Math.ceil(totalBrands / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalBrands,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBrandById = async (req, res) => {
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
const updateBrand = async (req, res) => {
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

    const brand = await findCategory(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    Object.assign(brand, updates);
    await brand.save();

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Brand, name or brandID already exists",
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

const deleteBrand = async (req, res) => {
  try {
    const brand = await findCategory(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Brand.deleteOne({ _id: brand._id });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: brand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
