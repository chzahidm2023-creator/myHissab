const Product = require("../ScheemaModals/productModal");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Validate optional Category, Brand and Unit references
const validateReferenceIds = (data) => {
  for (const field of ["category", "brand", "unit"]) {
    const value = data[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !mongoose.Types.ObjectId.isValid(value)
    ) {
      return `Invalid ${field} ID`;
    }
  }

  return null;
};

const normalizeReferenceIds = (data) => {
  for (const field of ["category", "brand", "unit"]) {
    if (data[field] === "" || data[field] === undefined) {
      if (data[field] === "") data[field] = null;
    }
  }

  return data;
};
const removeUploadedFile = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Uploaded image removed:", filePath);
    }
  } catch (error) {
    console.error("Error removing uploaded image:", error.message);
  }
};

const removeProductImage = (imagePath) => {
  if (!imagePath) return;
  try {
    let imageName = imagePath;
    try {
      imageName = new URL(imagePath).pathname;
    } catch {
      // Keep original path if it is not a URL
    }
    const filename = path.basename(String(imageName).replace(/\\/g, "/"));
    if (!filename) return;
    const uploadsDir = path.resolve(process.cwd(), "src", "uploads");

    const fullImagePath = path.join(uploadsDir, filename);

    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
      console.log("Product image deleted:", fullImagePath);
    } else {
      console.log("Product image not found:", fullImagePath);
    }
  } catch (error) {
    console.error("Error deleting product image:", error.message);
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.file) {
      productData.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    delete productData.categoryName;
    delete productData.brandName;
    delete productData.unitName;

    const referenceError = validateReferenceIds(productData);

    if (referenceError) {
      removeUploadedFile(req.file?.path);

      return res.status(400).json({
        success: false,
        message: referenceError,
      });
    }

    normalizeReferenceIds(productData);

    const openingStock = Number(productData.openingStock);

    productData.stockHistory = [
      {
        productName: productData.name,
        adjustmentType: "opening-stock",
        quantity: openingStock,
        remaining: openingStock,
        reason: "Opening stock",
        change: openingStock,
        totoalAfter: openingStock,
        date: new Date(),
      },
    ];

    const product = new Product(productData);
    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    removeUploadedFile(req.file?.path);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(400).json({
      success: false,
      message: error.code === 11000 ? "SKU already exists" : error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  let newImagePath = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      removeUploadedFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      removeUploadedFile(req.file?.path);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData = { ...req.body };

    delete updateData.categoryName;
    delete updateData.brandName;
    delete updateData.unitName;
    delete updateData.stockHistory;

    const referenceError = validateReferenceIds(updateData);

    if (referenceError) {
      removeUploadedFile(req.file?.path);
      return res.status(400).json({
        success: false,
        message: referenceError,
      });
    }

    normalizeReferenceIds(updateData);

    if (req.file) {
      newImagePath = req.file.path;
      updateData.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    if (updateData.openingStock !== undefined) {
      const newStock = Number(updateData.openingStock);

      if (
        updateData.openingStock === "" ||
        !Number.isFinite(newStock) ||
        newStock < 0
      ) {
        removeUploadedFile(newImagePath);
        return res.status(400).json({
          success: false,
          message: "Invalid opening stock",
        });
      }

      updateData.openingStock = newStock;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (req.file && existingProduct.image) {
      removeProductImage(existingProduct.image);
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    removeUploadedFile(newImagePath || req.file?.path);

    return res.status(400).json({
      success: false,
      message: error.code === 11000 ? "SKU already exists" : error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete product from database
    await Product.findByIdAndDelete(id);

    // Delete associated image from uploads folder
    if (product.image) {
      removeProductImage(product.image);
    }

    return res.status(200).json({
      success: true,
      message: "Product and associated image deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      brand,
      unit,
      status = "all",
      stockFilter,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { page, limit } = req.pagination;
    const query = { ...(req.dateQuery || {}) };

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { barcode: searchRegex },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Status must be active, inactive, or all",
      });
    }

    for (const [field, value] of Object.entries({ category, brand, unit })) {
      if (value) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field} ID`,
          });
        }

        query[field] = new mongoose.Types.ObjectId(value);
      }
    }

    if (stockFilter === "low-stock") {
      query.$expr = { $lte: ["$openingStock", "$minimumStock"] };
    } else if (stockFilter === "more-stock") {
      query.$expr = { $gt: ["$openingStock", "$minimumStock"] };
    }

    const allowedSortFields = [
      "name",
      "sku",
      "barcode",
      "createdAt",
      "updatedAt",
      "purchasePrice",
      "salePrice",
      "openingStock",
      "minimumStock",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOptions = {
      [safeSortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate("category", "name")
        .populate("brand", "name")
        .populate("unit", "name")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStockAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { adjustmentType, quantity, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!["increase", "decrease"].includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid adjustment type",
      });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }
    const productDoc = await Product.findById(id);
    if (!productDoc) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const currentStock = Number(productDoc.openingStock) || 0;
    let stockChange;
    if (adjustmentType === "increase") {
      stockChange = qty;
    } else {
      if (currentStock <= 0) {
        return res.status(400).json({
          success: false,
          message: "Stock is zero, cannot decrease",
        });
      }

      if (qty > currentStock) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }

      stockChange = -qty;
    }

    const updatedStock = currentStock + stockChange;
    productDoc.openingStock = updatedStock;
    productDoc.stockHistory.push({
      productName: productDoc.name,
      adjustmentType,
      quantity: qty,
      reason: reason || "",
      change: stockChange,
      totoalAfter: productDoc.openingStock,
      date: new Date(),
    });

    await productDoc.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated and history saved successfully",
      data: {
        productId: productDoc._id,
        previousStock: currentStock,
        updatedStock,
        latestAdjustment:
          productDoc.stockHistory[productDoc.stockHistory.length - 1],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getAllStockHistory = async (req, res) => {
  try {
    const { search = "", adjustmentType = "all" } = req.query;
    const { page, limit } = req.pagination;

    const filter = { ...req.dateQuery };

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { "stockHistory.productName": searchRegex },
        { "stockHistory.reason": searchRegex },
      ];
    }

    if (adjustmentType === "increase" || adjustmentType === "decrease") {
      filter["stockHistory.adjustmentType"] = adjustmentType;
    } else if (adjustmentType !== "all") {
      return res.status(400).json({
        success: false,
        message: "Adjustment type must be increase, decrease, or all",
      });
    }

    const result = await Product.aggregate([
      { $unwind: "$stockHistory" },
      { $match: filter },
      {
        $facet: {
          data: [
            { $sort: { "stockHistory.date": -1, "stockHistory._id": -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: "$stockHistory._id",
                productId: "$_id",
                productName: "$name",
                sku: 1,
                adjustmentType: "$stockHistory.adjustmentType",
                quantity: "$stockHistory.quantity",
                reason: "$stockHistory.reason",
                change: "$stockHistory.change",
                totoalAfter: "$stockHistory.totoalAfter",
                date: "$stockHistory.date",
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const history = result[0]?.data || [];
    const totalHistory = result[0]?.total[0]?.count || 0;
    const totalPages = Math.ceil(totalHistory / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalHistory,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  updateStockAdjustment,
  getAllStockHistory,
};
