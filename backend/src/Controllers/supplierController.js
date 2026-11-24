const Supplier = require("../ScheemaModals/supplierModal");
const TransactionRecords = require("../ScheemaModals/Accounts/paymentModal");
const manageSupplierLedger = async (supplier, openingBalance) => {
  let account = await TransactionRecords.findOne({
    partyType: "supplier",
    "supplier.partyId": supplier._id,
  });

  const opening = Math.abs(Number(openingBalance) || 0);

  if (!account) {
    account = new TransactionRecords({
      partyType: "supplier",
      supplier: {
        partyId: supplier._id,
        partyName: supplier.name,
        openingBalance: opening,
        closingPayable: opening,
        transactions: [],
      },
    });
  } else {
    account.supplier.partyId = supplier._id;
    account.supplier.partyName = supplier.name;
    account.supplier.openingBalance = opening;
    account.supplier.closingPayable = opening;
  }

  await account.save();
  return account;
};

const addSupplier = async (req, res) => {
  let savedSupplier;

  try {
    const opening = Number(req.body.openingBalance || 0);

    if (!Number.isFinite(opening) || opening < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid opening balance",
      });
    }

    savedSupplier = await Supplier.create({
      ...req.body,
      openingBalance: opening,
    });

    await manageSupplierLedger(savedSupplier, opening);

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: savedSupplier,
    });
  } catch (error) {
    if (savedSupplier) {
      await Supplier.deleteOne({ _id: savedSupplier._id });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllSupplier = async (req, res) => {
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
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { address: searchRegex },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    } else if (status === "inactive") {
      filter.isActive = false;
    } else if (status !== "all") {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use active, inactive, or all.",
      });
    }

    const query = Supplier.find(filter).sort({
      createdAt: -1,
      _id: -1,
    });

    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [supplier, totalSuppliers] = await Promise.all([
      query,
      Supplier.countDocuments(filter),
    ]);

    const totalPages = limit === "all" ? 1 : Math.ceil(totalSuppliers / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalSuppliers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      count: supplier.length,
      data: supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "supplier not found",
      });
    }
    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { openingBalance, ...supplierData } = req.body;

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (openingBalance !== undefined) {
      const opening = Number(openingBalance);

      if (!Number.isFinite(opening) || opening < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid opening balance",
        });
      }

      supplier.openingBalance = opening;
    }

    Object.assign(supplier, supplierData);

    await supplier.save();

    const ledger = await manageSupplierLedger(
      supplier,
      Number(supplier.openingBalance) || 0,
    );

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: supplier,
      ledger: {
        partyName: ledger.supplier.partyName,
        openingBalance: ledger.supplier.openingBalance,
        closingPayable: ledger.supplier.closingPayable,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addSupplier,
  updateSupplier,
  getAllSupplier,
  getSupplierById,
  deleteSupplier,
};
