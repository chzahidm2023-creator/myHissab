const Expense = require("../ScheemaModals/expensesModal");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../uploads");

const removeFile = async (filePath) => {
  if (!filePath) return;

  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, "..", filePath);

  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      attachment: req.file
        ? path.relative(path.join(__dirname, ".."), req.file.path)
        : "",
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    if (req.file) {
      await removeFile(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const { category, search, type = "daily", sortOrder = "desc" } = req.query;

    const { page, limit } = req.pagination;
    const filter = { ...req.dateQuery };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.description = {
        $regex: search,
        $options: "i",
      };
    }

    const [data, total, summary, reportData] = await Promise.all([
      Expense.find(filter)
        .populate("category")
        .sort({ date: -1, createdAt: -1 })
        .skip(limit === "all" ? 0 : (page - 1) * Number(limit))
        .limit(limit === "all" ? 0 : Number(limit))
        .lean(),

      Expense.countDocuments(filter),

      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalExpenses: 1,
            totalAmount: 1,
          },
        },
      ]),

      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: {
                format:
                  type === "weekly"
                    ? "%G-W%V"
                    : type === "monthly"
                      ? "%Y-%m"
                      : "%Y-%m-%d",
                date: "$date",
              },
            },
            totalExpenses: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            period: "$_id",
            totalExpenses: 1,
            totalAmount: 1,
          },
        },
        {
          $sort: {
            period: sortOrder === "asc" ? 1 : -1,
          },
        },
      ]),
    ]);

    const totalPages =
      limit === "all" ? (total > 0 ? 1 : 0) : Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      summary: summary[0] || {
        totalExpenses: 0,
        totalAmount: 0,
      },
      reportData,
      data,
      pagination: {
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("category");
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT - Update Expense
const updateExpense = async (req, res) => {
  let updated = false;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      if (req.file) {
        await removeFile(req.file.path).catch(() => {});
      }
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    const oldFile = expense.attachment;
    Object.assign(expense, req.body);
    if (req.file) {
      expense.attachment = path.relative(
        path.join(__dirname, ".."),
        req.file.path,
      );
    }
    await expense.save();
    updated = true;
    // Delete old file after successful update
    if (req.file && oldFile) {
      await removeFile(oldFile).catch((error) => {
        console.error("Old file deletion error:", error.message);
      });
    }

    await expense.populate("category");

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    if (req.file && !updated) {
      await removeFile(req.file.path).catch(() => {});
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// DELETE - Delete Expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    await removeFile(expense.attachment);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
