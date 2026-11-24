const mongoose = require("mongoose");
const PurchaseInvoice = require("../ScheemaModals/purchaseInvoiceModal");
const Supplier = require("../ScheemaModals/supplierModal");
const Product = require("../ScheemaModals/productModal");
const TransactionRecords = require("../ScheemaModals/Accounts/paymentModal");

const postPurchaseInvoice = async (req, res) => {
  let invoice = null;
  let account = null;
  let previousBalance = 0;
  let accountCreated = false;
  let transactionId = null;
  const stockUpdates = [];

  try {
    const {
      supplier,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      paidAmount,
      notes,
      invoiceDate,
    } = req.body;

    if (!supplier || !mongoose.Types.ObjectId.isValid(supplier)) {
      return res.status(400).json({
        success: false,
        message: "supplier is required",
        error: "Valid supplier ID is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice item is required",
      });
    }

    if (subtotal === undefined || grandTotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "Subtotal and grandTotal are required",
      });
    }

    const total = Number(grandTotal);
    const paid = Number(paidAmount || 0);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(paid) ||
      total < 0 ||
      paid < 0 ||
      paid > total
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice or payment amount",
      });
    }

    const productQuantities = new Map();

    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: "product is required",
          error: "Invalid product ID",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      const productId = String(item.product);

      productQuantities.set(
        productId,
        (productQuantities.get(productId) || 0) + quantity,
      );
    }

    const supplierData = await Supplier.findById(supplier);

    if (!supplierData) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    for (const [productId, quantity] of productQuantities) {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $inc: {
            openingStock: quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        throw Object.assign(
          new Error(`Product not found with ID: ${productId}`),
          { statusCode: 404 },
        );
      }

      const historyId = new mongoose.Types.ObjectId();

      stockUpdates.push({
        productId,
        quantity,
        historyId,
      });

      await Product.updateOne(
        { _id: productId },
        {
          $push: {
            stockHistory: {
              _id: historyId,
              productName: updatedProduct.name,
              adjustmentType: "purchase",
              quantity,
              remaining: updatedProduct.openingStock,
              reason: "Purchase",
              change: quantity,
              totoalAfter: updatedProduct.openingStock,
              date: invoiceDate ? new Date(invoiceDate) : new Date(),
            },
          },
        },
      );

      console.log(
        `${updatedProduct.name} stock increased. New openingStock:`,
        updatedProduct.openingStock,
      );
    }

    const remaining = Number((total - paid).toFixed(2));

    invoice = await PurchaseInvoice.create({
      supplier,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal: total,
      paidAmount: paid,
      remainingAmount: remaining,
      paymentStatus: remaining === 0 ? "paid" : paid > 0 ? "partial" : "unpaid",
      notes,
      invoiceDate,
    });

    account = await TransactionRecords.findOne({
      partyType: "supplier",
      "supplier.partyId": supplierData._id,
    });

    if (!account) {
      const opening = Math.abs(Number(supplierData.openingBalance || 0));

      account = new TransactionRecords({
        partyType: "supplier",
        supplier: {
          partyId: supplierData._id,
          partyName: supplierData.name,
          openingBalance: opening,
          closingPayable: opening,
          transactions: [],
        },
      });

      accountCreated = true;
    }

    account.supplier.partyName = supplierData.name;
    previousBalance = Number(account.supplier.closingPayable || 0);

    if (remaining > 0) {
      const runningBalance = Number((previousBalance + remaining).toFixed(2));

      account.supplier.transactions.push({
        transactionType: "invoice",
        direction: "debit",
        amount: remaining,
        debit: remaining,
        credit: 0,
        runningBalance,
        paymentMethod: "other",
        paymentDate: invoiceDate || new Date(),
        ref: invoice.invoiceNumber,
        notes: `Purchase Invoice ${invoice.invoiceNumber}`,
      });

      const newTransaction =
        account.supplier.transactions[account.supplier.transactions.length - 1];

      transactionId = newTransaction._id;
      account.supplier.closingPayable = runningBalance;
    }

    await account.save();

    const populatedInvoice = await PurchaseInvoice.findById(invoice._id)
      .populate("supplier", "name phone email")
      .populate("items.product", "name sku");

    return res.status(201).json({
      success: true,
      message: "Purchase invoice posted and stock updated successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    console.error("PURCHASE INVOICE ERROR:", error);

    try {
      if (accountCreated && account?._id) {
        await TransactionRecords.deleteOne({
          _id: account._id,
        });
      } else if (account?._id && transactionId) {
        await TransactionRecords.updateOne(
          { _id: account._id },
          {
            $pull: {
              "supplier.transactions": {
                _id: transactionId,
              },
            },
            $set: {
              "supplier.closingPayable": previousBalance,
            },
          },
        );
      }
    } catch (rollbackError) {
      console.error("LEDGER ROLLBACK ERROR:", rollbackError);
    }

    try {
      if (invoice?._id) {
        await PurchaseInvoice.deleteOne({
          _id: invoice._id,
        });
      }
    } catch (rollbackError) {
      console.error("INVOICE ROLLBACK ERROR:", rollbackError);
    }

    for (const update of stockUpdates.reverse()) {
      try {
        await Product.updateOne(
          { _id: update.productId },
          {
            $inc: {
              openingStock: -update.quantity,
            },
            $pull: {
              stockHistory: {
                _id: update.historyId,
              },
            },
          },
        );
      } catch (rollbackError) {
        console.error("STOCK ROLLBACK ERROR:", rollbackError);
      }
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to post purchase invoice",
    });
  }
};

const getAllPurchaseInvoices = async (req, res) => {
  try {
    const {
      search = "",
      supplier,
      paymentStatus,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { page, limit } = req.pagination;
    const query = { ...req.dateQuery };

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      query.$or = [{ invoiceNumber: searchRegex }, { notes: searchRegex }];
    }

    if (supplier) {
      if (!mongoose.Types.ObjectId.isValid(supplier)) {
        return res.status(400).json({
          success: false,
          message: "Invalid supplier ID",
        });
      }

      query.supplier = new mongoose.Types.ObjectId(supplier);
    }

    if (paymentStatus) {
      const allowedStatuses = ["paid", "partial", "unpaid"];

      if (!allowedStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      query.paymentStatus = paymentStatus;
    }

    const allowedSortFields = [
      "invoiceNumber",
      "invoiceDate",
      "createdAt",
      "updatedAt",
      "subtotal",
      "discountAmount",
      "taxAmount",
      "grandTotal",
      "paidAmount",
      "remainingAmount",
      "paymentStatus",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOptions = {
      [safeSortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [invoices, totalInvoices, summaryResult] = await Promise.all([
      PurchaseInvoice.find(query)
        .populate("supplier", "name phone email")
        .populate("items.product", "name sku")
        .sort(sortOptions)
        .skip(limit === "all" ? 0 : (page - 1) * Number(limit))
        .limit(limit === "all" ? 0 : Number(limit))
        .lean(),

      PurchaseInvoice.countDocuments(query),

      PurchaseInvoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,

            totalPurchase: {
              $sum: { $ifNull: ["$grandTotal", 0] },
            },

            totalPaid: {
              $sum: { $ifNull: ["$paidAmount", 0] },
            },

            totalRemaining: {
              $sum: { $ifNull: ["$remainingAmount", 0] },
            },

            totalReturns: {
              $sum: {
                $reduce: {
                  input: { $ifNull: ["$returnList", []] },
                  initialValue: 0,
                  in: {
                    $add: ["$$value", { $ifNull: ["$$this.returnAmount", 0] }],
                  },
                },
              },
            },

            totalInvoices: { $sum: 1 },

            totalSuppliers: {
              $addToSet: "$supplier",
            },

            paidInvoices: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
              },
            },

            partialInvoices: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "partial"] }, 1, 0],
              },
            },

            unpaidInvoices: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalPurchase: 1,
            totalPaid: 1,
            totalRemaining: 1,
            totalReturns: 1,

            netPurchase: {
              $subtract: ["$totalPurchase", "$totalReturns"],
            },

            totalInvoices: 1,

            totalSuppliers: {
              $size: {
                $filter: {
                  input: "$totalSuppliers",
                  as: "supplier",
                  cond: { $ne: ["$$supplier", null] },
                },
              },
            },

            paidInvoices: 1,
            partialInvoices: 1,
            unpaidInvoices: 1,
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalPurchase: 0,
      totalPaid: 0,
      totalRemaining: 0,
      totalReturns: 0,
      netPurchase: 0,
      totalInvoices: 0,
      totalSuppliers: 0,
      paidInvoices: 0,
      partialInvoices: 0,
      unpaidInvoices: 0,
    };

    const totalPages =
      limit === "all"
        ? totalInvoices > 0
          ? 1
          : 0
        : Math.ceil(totalInvoices / Number(limit));

    return res.status(200).json({
      success: true,
      summary,

      pagination: {
        totalInvoices,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },

      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const returnPurchaseInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { returnAmount, returnDate, items } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase invoice ID",
      });
    }
    const amount = Number(returnAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid return amount is required",
      });
    }
    if (!returnDate || isNaN(new Date(returnDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Valid return date is required",
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Return products are required",
      });
    }
    let result;
    await session.withTransaction(async () => {
      const invoice = await PurchaseInvoice.findById(id).session(session);
      if (!invoice) {
        throw new Error("Purchase invoice not found");
      }
      const lastReturn = invoice.returnList?.[invoice.returnList.length - 1];
      const nextNumber = lastReturn
        ? Number(lastReturn.returnInvoiceNumber.split("-")[1]) + 1
        : 1;
      const returnInvoiceNumber = `RET-PUR-${String(nextNumber).padStart(2, "0")}`;
      const supplier = await Supplier.findById(invoice.supplier).session(
        session,
      );
      if (!supplier) {
        throw new Error("Invoice supplier not found");
      }
      const purchasedQuantities = new Map();
      for (const item of invoice.items) {
        const productId = String(item.product);
        purchasedQuantities.set(
          productId,
          (purchasedQuantities.get(productId) || 0) + Number(item.quantity),
        );
      }
      const returnedQuantities = new Map();
      for (const returnRecord of invoice.returnList || []) {
        for (const returnedItem of returnRecord.returnedItems || []) {
          const productId = String(returnedItem.product);
          returnedQuantities.set(
            productId,
            (returnedQuantities.get(productId) || 0) +
              Number(returnedItem.quantity),
          );
        }
      }
      const currentQuantities = new Map();
      for (const item of items) {
        if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
          throw new Error("Invalid return product ID");
        }
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error("Invalid return quantity");
        }
        const productId = String(item.product);
        currentQuantities.set(
          productId,
          (currentQuantities.get(productId) || 0) + quantity,
        );
      }
      const returnedItems = [];
      for (const [productId, quantity] of currentQuantities) {
        const purchased = purchasedQuantities.get(productId) || 0;
        const alreadyReturned = returnedQuantities.get(productId) || 0;
        const availableToReturn = purchased - alreadyReturned;
        if (quantity > availableToReturn) {
          throw new Error(
            `Return quantity exceeds purchased quantity. Product ID: ${productId}, Available to return: ${availableToReturn}, Requested: ${quantity}`,
          );
        }
        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }
        if (product.openingStock < quantity) {
          throw new Error(
            `Insufficient stock for return. Available stock: ${product.openingStock}, Requested: ${quantity}`,
          );
        }
        const remainingStock = Number(product.openingStock) - quantity;
        returnedItems.push({
          product: product._id,
          productName: product.name,
          quantity,
        });
        await Product.updateOne(
          { _id: productId },
          {
            $inc: {
              openingStock: -quantity,
            },
            $push: {
              stockHistory: {
                productName: product.name,
                adjustmentType: "purchase-returns",
                quantity,
                remaining: remainingStock,
                reason: "Purchase Return",
                change: -quantity,
                totoalAfter: remainingStock,
                date: new Date(returnDate),
              },
            },
          },
          { session },
        );
      }
      invoice.remainingAmount = Number(
        Math.max(0, Number(invoice.remainingAmount || 0) - amount).toFixed(2),
      );
      invoice.returns = Number(
        (Number(invoice.returns || 0) + amount).toFixed(2),
      );
      invoice.returnList.push({
        returnInvoiceNumber,
        returnDate: new Date(returnDate),
        returnAmount: amount,
        originalPurchaseInvoiceNumber: invoice.invoiceNumber,
        returnedItems,
      });
      invoice.paymentStatus =
        invoice.remainingAmount === 0
          ? "paid"
          : Number(invoice.paidAmount || 0) > 0
            ? "partial"
            : "unpaid";
      await invoice.save({ session });
      const account = await TransactionRecords.findOne({
        partyType: "supplier",
        "supplier.partyId": supplier._id,
      }).session(session);
      if (!account) {
        throw new Error("Supplier transaction record not found");
      }
      if (
        account.partyType !== "supplier" ||
        String(account.supplier.partyId) !== String(supplier._id)
      ) {
        throw new Error("Supplier ledger verification failed");
      }
      const previousBalance = Number(account.supplier.closingPayable || 0);
      const runningBalance = Number((previousBalance - amount).toFixed(2));
      account.supplier.transactions.push({
        transactionType: "invoiceReturn",
        direction: "credit",
        amount,
        debit: 0,
        credit: amount,
        runningBalance,
        paymentMethod: "other",
        paymentDate: new Date(returnDate),
        ref: returnInvoiceNumber,
        notes: `Return against Purchase Invoice ${invoice.invoiceNumber}`,
      });
      account.supplier.closingPayable = runningBalance;
      await account.save({ session });
      result = {
        returnInvoiceNumber,
        originalPurchaseInvoiceNumber: invoice.invoiceNumber,
        returnAmount: amount,
        remainingAmount: invoice.remainingAmount,
        returns: invoice.returns,
        returnDate: new Date(returnDate),
        returnedItems,
      };
    });
    return res.status(200).json({
      success: true,
      message: "Purchase invoice returned successfully",
      data: result,
    });
  } catch (error) {
    console.error("PURCHASE INVOICE RETURN ERROR:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to return purchase invoice",
    });
  } finally {
    await session.endSession();
  }
};

const getSaleInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await PurchaseInvoice.findById(id)
      .populate("supplier", "name phone email address")
      .populate("items.product", "name sku")
      .populate("returnList.returnedItems.product", "name sku");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Purchase invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPurchaseReturns = async (req, res) => {
  try {
    const { search = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const { page, limit } = req.pagination;
    const dateRange = req.dateQuery?.["returnList.returnDate"];

    const query = {
      returnList: { $exists: true, $ne: [] },
      ...req.dateQuery,
    };

    if (search.trim()) {
      query.$or = [
        { invoiceNumber: { $regex: search.trim(), $options: "i" } },
        {
          "returnList.returnInvoiceNumber": {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          "returnList.originalPurchaseInvoiceNumber": {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "invoiceNumber",
      "returnList.returnDate",
      "returnList.returnAmount",
    ];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOptions = {
      [safeSortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const [invoices, totalCount] = await Promise.all([
      PurchaseInvoice.find(query)
        .populate("supplier", "name phone email address")
        .populate("returnList.returnedItems.product", "name sku")
        .select("_id invoiceNumber supplier returnList createdAt")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      PurchaseInvoice.countDocuments(query),
    ]);

    const returns = invoices.flatMap((invoice) =>
      invoice.returnList
        .filter((item) => {
          if (!dateRange) return true;

          const returnDate = new Date(item.returnDate);

          if (dateRange.$gte && returnDate < dateRange.$gte) return false;
          if (dateRange.$lte && returnDate > dateRange.$lte) return false;

          return true;
        })
        .map((item) => ({
          ...item,
          originalInvoiceId: invoice._id,
          supplier: invoice.supplier,
          originalPurchaseInvoiceNumber: invoice.invoiceNumber,
        })),
    );

    return res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalReturns: totalCount,
        limit,
      },
      count: returns.length,
      data: returns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  postPurchaseInvoice,
  getAllPurchaseInvoices,
  returnPurchaseInvoice,
  getSaleInvoiceById,
  getAllPurchaseReturns,
};
