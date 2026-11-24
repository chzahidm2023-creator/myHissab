const mongoose = require("mongoose");
const SaleInvoice = require("../ScheemaModals/SalesModal");
const Customer = require("../ScheemaModals/CustomerModal");
const Product = require("../ScheemaModals/productModal");
const TransactionRecords = require("../ScheemaModals/Accounts/paymentModal");

const postSaleInvoice = async (req, res) => {
  let invoice = null;
  let account = null;
  let previousBalance = 0;
  let accountCreated = false;
  let transactionId = null;
  const stockUpdates = [];

  try {
    const {
      customer,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      paidAmount,
      notes,
      invoiceDate,
    } = req.body;

    if (!customer || !mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({
        success: false,
        message: "customer is required",
        error: "Invalid customer ID",
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
          message: "Product is required",
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

    const customerData = await Customer.findById(customer);

    if (!customerData) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    for (const [productId, quantity] of productQuantities) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          openingStock: { $gte: quantity },
        },
        {
          $inc: {
            openingStock: -quantity,
          },
        },
        {
          new: true,
        },
      );

      if (!updatedProduct) {
        const product = await Product.findById(productId);

        if (!product) {
          throw Object.assign(new Error("Product not found"), {
            statusCode: 404,
          });
        }

        throw Object.assign(
          new Error(
            `Insufficient stock for ${product.name}. Available stock: ${product.openingStock}, Requested quantity: ${quantity}`,
          ),
          { statusCode: 400 },
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
              adjustmentType: "sale",
              quantity,
              remaining: updatedProduct.openingStock,
              reason: "Sale",
              change: -quantity,
              totoalAfter: updatedProduct.openingStock,
              date: invoiceDate ? new Date(invoiceDate) : new Date(),
            },
          },
        },
      );
    }

    const remaining = Number((total - paid).toFixed(2));

    invoice = await SaleInvoice.create({
      customer,
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
      partyType: "customer",
      "customer.partyId": customerData._id,
    });

    if (!account) {
      const opening = Math.abs(Number(customerData.openingBalance || 0));

      account = new TransactionRecords({
        partyType: "customer",
        customer: {
          partyId: customerData._id,
          partyName: customerData.name,
          openingBalance: opening,
          closingReceivable: -opening,
          transactions: [],
        },
      });

      accountCreated = true;
    }
    account.customer.partyName = customerData.name;
    previousBalance = Number(account.customer.closingReceivable || 0);
    if (remaining > 0) {
      const runningBalance = Number((previousBalance + remaining).toFixed(2));
      account.customer.transactions.push({
        transactionType: "invoice",
        direction: "debit",
        amount: remaining,
        debit: remaining,
        credit: 0,
        runningBalance,
        paymentMethod: "other",
        paymentDate: invoiceDate || new Date(),
        ref: invoice.invoiceNumber,
        notes: `Sale Invoice ${invoice.invoiceNumber}`,
      });

      const newTransaction =
        account.customer.transactions[account.customer.transactions.length - 1];

      transactionId = newTransaction._id;
      account.customer.closingReceivable = runningBalance;
    }

    await account.save();

    const populatedInvoice = await SaleInvoice.findById(invoice._id)
      .populate("customer", "name phone email")
      .populate("items.product", "name sku");

    return res.status(201).json({
      success: true,
      message: "Sale invoice posted and stock updated successfully",
      data: populatedInvoice,
    });
  } catch (error) {
    console.error("SALE INVOICE ERROR:", error);

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
              "customer.transactions": {
                _id: transactionId,
              },
            },
            $set: {
              "customer.closingReceivable": previousBalance,
            },
          },
        );
      }
    } catch (rollbackError) {
      console.error("LEDGER ROLLBACK ERROR:", rollbackError);
    }

    try {
      if (invoice?._id) {
        await SaleInvoice.deleteOne({
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
              openingStock: update.quantity,
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
      message: error.message || "Failed to post sale invoice",
    });
  }
};

const getAllSaleInvoices = async (req, res) => {
  try {
    const {
      search = "",
      customer,
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
    if (customer) {
      if (!mongoose.Types.ObjectId.isValid(customer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
      }
      query.customer = new mongoose.Types.ObjectId(customer);
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
      SaleInvoice.find(query)
        .populate("customer", "name phone email")
        .populate("items.product", "name sku")
        .sort(sortOptions)
        .skip(limit === "all" ? 0 : (page - 1) * Number(limit))
        .limit(limit === "all" ? 0 : Number(limit))
        .lean(),
      SaleInvoice.countDocuments(query),
      SaleInvoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: { $ifNull: ["$grandTotal", 0] },
            },
            totalPaid: {
              $sum: { $ifNull: ["$paidAmount", 0] },
            },
            totalRemaining: {
              $sum: { $ifNull: ["$remainingAmount", 0] },
            },
            totalReturns: {
              $sum: { $ifNull: ["$returns", 0] },
            },
            totalInvoices: { $sum: 1 },
            totalCustomers: {
              $addToSet: "$customer",
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
            totalSales: 1,
            totalPaid: 1,
            totalRemaining: 1,
            totalReturns: 1,
            netSales: {
              $subtract: ["$totalSales", "$totalReturns"],
            },
            totalInvoices: 1,
            totalCustomers: { $size: "$totalCustomers" },
            paidInvoices: 1,
            partialInvoices: 1,
            unpaidInvoices: 1,
          },
        },
      ]),
    ]);

    const summary = summaryResult[0] || {
      totalSales: 0,
      totalPaid: 0,
      totalRemaining: 0,
      totalReturns: 0,
      netSales: 0,
      totalInvoices: 0,
      totalCustomers: 0,
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

const returnSaleInvoice = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { returnAmount, returnDate, items } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sale invoice ID",
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
      const invoice = await SaleInvoice.findById(id).session(session);

      if (!invoice) {
        throw new Error("Sale invoice not found");
      }

      const lastReturn = invoice.returnList?.[invoice.returnList.length - 1];

      const nextNumber = lastReturn
        ? Number(lastReturn.returnInvoiceNumber.split("-")[1]) + 1
        : 1;

      const returnInvoiceNumber = `RETURN-${String(nextNumber).padStart(2, "0")}`;

      const customer = await Customer.findById(invoice.customer).session(
        session,
      );

      if (!customer) {
        throw new Error("Invoice customer not found");
      }

      const soldQuantities = new Map();

      for (const item of invoice.items) {
        const productId = String(item.product);

        soldQuantities.set(
          productId,
          (soldQuantities.get(productId) || 0) + Number(item.quantity),
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
        const sold = soldQuantities.get(productId) || 0;
        const alreadyReturned = returnedQuantities.get(productId) || 0;
        const availableToReturn = sold - alreadyReturned;

        if (quantity > availableToReturn) {
          throw new Error(
            `Return quantity exceeds sold quantity. Product ID: ${productId}, Available to return: ${availableToReturn}, Requested: ${quantity}`,
          );
        }

        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            $inc: {
              openingStock: quantity,
            },
            $push: {
              stockHistory: {
                productName: product.name,
                adjustmentType: "sale-retuns",
                quantity,
                remaining: Number(product.openingStock) + quantity,
                reason: "Sale Return",
                change: quantity,
                totoalAfter: Number(product.openingStock) + quantity,
                date: new Date(returnDate),
              },
            },
          },
          {
            new: true,
            session,
          },
        );

        returnedItems.push({
          product: updatedProduct._id,
          productName: updatedProduct.name,
          quantity,
        });
      }

      invoice.remainingAmount = Number(
        (Number(invoice.remainingAmount || 0) - amount).toFixed(2),
      );

      invoice.returns = Number(
        (Number(invoice.returns || 0) + amount).toFixed(2),
      );

      invoice.returnList.push({
        returnInvoiceNumber,
        returnDate: new Date(returnDate),
        returnAmount: amount,
        originalSaleInvoiceNumber: invoice.invoiceNumber,
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
        partyType: "customer",
        "customer.partyId": customer._id,
      }).session(session);

      if (!account) {
        throw new Error("Customer transaction record not found");
      }

      if (
        account.partyType !== "customer" ||
        String(account.customer.partyId) !== String(customer._id)
      ) {
        throw new Error("Customer ledger verification failed");
      }

      const previousBalance = Number(account.customer.closingReceivable || 0);

      const runningBalance = Number((previousBalance - amount).toFixed(2));

      account.customer.transactions.push({
        transactionType: "invoiceReturn",
        direction: "credit",
        amount,
        debit: 0,
        credit: amount,
        runningBalance,
        paymentMethod: "other",
        paymentDate: new Date(returnDate),
        ref: returnInvoiceNumber,
        notes: `Return against Sale Invoice ${invoice.invoiceNumber}`,
      });

      account.customer.closingReceivable = runningBalance;

      await account.save({ session });

      result = {
        returnInvoiceNumber,
        originalSaleInvoiceNumber: invoice.invoiceNumber,
        returnAmount: amount,
        remainingAmount: invoice.remainingAmount,
        returns: invoice.returns,
        returnDate: new Date(returnDate),
        returnedItems,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Sale invoice returned successfully",
      data: result,
    });
  } catch (error) {
    console.error("SALE INVOICE RETURN ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to return sale invoice",
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

    const invoice = await SaleInvoice.findById(id)
      .populate("customer", "name phone email address")
      .populate("items.product", "name sku")
      .populate("returnList.returnedItems.product", "name sku");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Sale invoice not found",
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
const getAllSaleReturns = async (req, res) => {
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
          "returnList.originalSaleInvoiceNumber": {
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
      SaleInvoice.find(query)
        .populate("customer", "name phone email address")
        .populate("returnList.returnedItems.product", "name sku")
        .select("_id invoiceNumber customer returnList createdAt")
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      SaleInvoice.countDocuments(query),
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
          customer: invoice.customer,
          originalSaleInvoiceNumber: invoice.invoiceNumber,
        })),
    );

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalReturns: totalCount,
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
  postSaleInvoice,
  getAllSaleInvoices,
  returnSaleInvoice,
  getSaleInvoiceById,
  getAllSaleReturns,
};
