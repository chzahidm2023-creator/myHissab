const mongoose = require("mongoose");
const SaleInvoice = require("../../ScheemaModals/SalesModal");
const Customer = require("../../ScheemaModals/CustomerModal");
const Product = require("../../ScheemaModals/productModal");
const Supplier = require("../../ScheemaModals/supplierModal");
const PurchaseInvoice = require("../../ScheemaModals/purchaseInvoiceModal");
const Expense = require("../../ScheemaModals/expensesModal");
const TransactionRecords = require("../../ScheemaModals/Accounts/paymentModal");
const getSalesReports = async (req, res) => {
  try {
    const {
      type = "daily",
      customerId,
      productId,
      sortBy = "totalSales",
      sortOrder = "desc",
    } = req.query;

    const { page, limit } = req.pagination;
    const query = { ...req.dateQuery };

    const allowedTypes = ["daily", "weekly", "monthly", "customer", "product"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sales report type",
      });
    }

    if (customerId) {
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
      }

      query.customer = new mongoose.Types.ObjectId(customerId);
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      query["items.product"] = new mongoose.Types.ObjectId(productId);
    }

    const direction = sortOrder === "asc" ? 1 : -1;
    let data = [];
    let summary = {};

    if (["daily", "weekly", "monthly"].includes(type)) {
      const groupFormat = {
        daily: {
          $dateTrunc: {
            date: "$invoiceDate",
            unit: "day",
          },
        },
        weekly: {
          $dateTrunc: {
            date: "$invoiceDate",
            unit: "week",
            startOfWeek: "monday",
          },
        },
        monthly: {
          $dateTrunc: {
            date: "$invoiceDate",
            unit: "month",
          },
        },
      };

      const results = await SaleInvoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: groupFormat[type],
            totalInvoices: { $sum: 1 },
            totalSales: { $sum: "$grandTotal" },
            totalReturns: { $sum: { $ifNull: ["$returns", 0] } },
          },
        },
        { $sort: { _id: direction } },
        {
          $addFields: {
            netSales: {
              $subtract: ["$totalSales", "$totalReturns"],
            },
          },
        },
      ]);

      data = results.map((item) => {
        const date = new Date(item._id);

        const common = {
          totalInvoices: item.totalInvoices,
          totalSales: item.totalSales,
          totalReturns: item.totalReturns,
          netSales: item.netSales,
        };

        if (type === "daily") {
          const endDate = new Date(date);
          endDate.setUTCHours(23, 59, 59, 999);

          return {
            date: item._id,
            startDate: item._id,
            endDate,
            ...common,
          };
        }

        if (type === "weekly") {
          const weekEnd = new Date(date);
          weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
          weekEnd.setUTCHours(23, 59, 59, 999);

          return {
            weekStart: item._id,
            weekEnd,
            startDate: item._id,
            endDate: weekEnd,
            ...common,
          };
        }

        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();

        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        return {
          month: month + 1,
          year,
          startDate,
          endDate,
          ...common,
        };
      });

      summary = data.reduce(
        (acc, item) => {
          acc.totalInvoices += item.totalInvoices;
          acc.totalSales += item.totalSales;
          acc.totalReturns += item.totalReturns;
          acc.netSales += item.netSales;
          return acc;
        },
        {
          totalInvoices: 0,
          totalSales: 0,
          totalReturns: 0,
          netSales: 0,
        },
      );
    }

    if (type === "customer") {
      const allowedSort = [
        "totalInvoices",
        "totalSales",
        "totalReturns",
        "netSales",
      ];

      const safeSort = allowedSort.includes(sortBy) ? sortBy : "totalSales";

      data = await SaleInvoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$customer",
            totalInvoices: { $sum: 1 },
            totalSales: { $sum: "$grandTotal" },
            totalReturns: { $sum: { $ifNull: ["$returns", 0] } },
          },
        },
        {
          $addFields: {
            netSales: {
              $subtract: ["$totalSales", "$totalReturns"],
            },
          },
        },
        {
          $lookup: {
            from: Customer.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            customer: {
              _id: "$customer._id",
              name: "$customer.name",
            },
            totalInvoices: 1,
            totalSales: 1,
            totalReturns: 1,
            netSales: 1,
          },
        },
        { $sort: { [safeSort]: direction } },
      ]);

      summary = data.reduce(
        (acc, item) => {
          acc.totalInvoices += item.totalInvoices;
          acc.totalSales += item.totalSales;
          acc.totalReturns += item.totalReturns;
          acc.netSales += item.netSales;
          return acc;
        },
        {
          totalCustomers: data.length,
          totalInvoices: 0,
          totalSales: 0,
          totalReturns: 0,
          netSales: 0,
        },
      );
    }

    if (type === "product") {
      const [sales, returns] = await Promise.all([
        SaleInvoice.aggregate([
          { $match: query },
          { $unwind: "$items" },
          ...(productId
            ? [
                {
                  $match: {
                    "items.product": new mongoose.Types.ObjectId(productId),
                  },
                },
              ]
            : []),
          {
            $group: {
              _id: "$items.product",
              productName: { $first: "$items.productName" },
              totalQuantity: { $sum: "$items.quantity" },
              totalSales: { $sum: "$items.total" },
            },
          },
        ]),
        SaleInvoice.aggregate([
          { $match: query },
          { $unwind: "$returnList" },
          { $unwind: "$returnList.returnedItems" },
          ...(productId
            ? [
                {
                  $match: {
                    "returnList.returnedItems.product":
                      new mongoose.Types.ObjectId(productId),
                  },
                },
              ]
            : []),
          {
            $addFields: {
              originalItem: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$items",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.product",
                          "$returnList.returnedItems.product",
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$returnList.returnedItems.product",
              returnedQuantity: {
                $sum: "$returnList.returnedItems.quantity",
              },
              totalReturns: {
                $sum: {
                  $multiply: [
                    "$returnList.returnedItems.quantity",
                    { $ifNull: ["$originalItem.price", 0] },
                  ],
                },
              },
            },
          },
        ]),
      ]);

      const returnMap = new Map(
        returns.map((item) => [String(item._id), item]),
      );

      const productIds = sales.map((item) => item._id).filter(Boolean);

      const products = await Product.find({
        _id: { $in: productIds },
      })
        .select("name")
        .lean();

      const productMap = new Map(
        products.map((item) => [String(item._id), item]),
      );

      data = sales.map((item) => {
        const returned = returnMap.get(String(item._id));
        const totalReturns = returned?.totalReturns || 0;
        const returnedQuantity = returned?.returnedQuantity || 0;

        return {
          product: {
            _id: item._id,
            name: productMap.get(String(item._id))?.name || item.productName,
          },
          totalQuantity: item.totalQuantity,
          returnedQuantity,
          netQuantity: item.totalQuantity - returnedQuantity,
          totalSales: item.totalSales,
          totalReturns,
          netSales: item.totalSales - totalReturns,
        };
      });

      const allowedSort = [
        "totalQuantity",
        "returnedQuantity",
        "netQuantity",
        "totalSales",
        "totalReturns",
        "netSales",
      ];

      const safeSort = allowedSort.includes(sortBy) ? sortBy : "totalSales";

      data.sort((a, b) => (a[safeSort] - b[safeSort]) * direction);

      summary = data.reduce(
        (acc, item) => {
          acc.totalQuantity += item.totalQuantity;
          acc.returnedQuantity += item.returnedQuantity;
          acc.netQuantity += item.netQuantity;
          acc.totalSales += item.totalSales;
          acc.totalReturns += item.totalReturns;
          acc.netSales += item.netSales;
          return acc;
        },
        {
          totalProducts: data.length,
          totalQuantity: 0,
          returnedQuantity: 0,
          netQuantity: 0,
          totalSales: 0,
          totalReturns: 0,
          netSales: 0,
        },
      );
    }

    const totalRecords = data.length;
    const totalPages = limit === "all" ? 1 : Math.ceil(totalRecords / limit);

    const paginatedData =
      limit === "all" ? data : data.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      type,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: limit !== "all" && page < totalPages,
        hasPrevPage: page > 1,
      },
      summary,
      count: paginatedData.length,
      data: paginatedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPurchaseReports = async (req, res) => {
  try {
    const {
      type = "supplier",
      supplierId,
      productId,
      sortBy = "netPurchases",
      sortOrder = "desc",
    } = req.query;

    const { page, limit } = req.pagination;
    const query = { ...req.dateQuery };

    const allowedTypes = ["supplier", "product"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase report type",
      });
    }

    if (supplierId) {
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid supplier ID",
        });
      }

      query.supplier = new mongoose.Types.ObjectId(supplierId);
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      query["items.product"] = new mongoose.Types.ObjectId(productId);
    }

    const direction = sortOrder === "asc" ? 1 : -1;

    let data = [];
    let summary = {};

    if (type === "supplier") {
      const allowedSort = [
        "totalInvoices",
        "totalPurchases",
        "totalReturns",
        "netPurchases",
      ];

      const safeSort = allowedSort.includes(sortBy) ? sortBy : "netPurchases";

      data = await PurchaseInvoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$supplier",
            totalInvoices: { $sum: 1 },
            totalPurchases: {
              $sum: { $ifNull: ["$grandTotal", 0] },
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
          },
        },
        {
          $addFields: {
            netPurchases: {
              $subtract: ["$totalPurchases", "$totalReturns"],
            },
          },
        },
        {
          $lookup: {
            from: Supplier.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "supplier",
          },
        },
        {
          $unwind: {
            path: "$supplier",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            supplier: {
              _id: "$supplier._id",
              name: "$supplier.name",
            },
            totalInvoices: 1,
            totalPurchases: 1,
            totalReturns: 1,
            netPurchases: 1,
          },
        },
        { $sort: { [safeSort]: direction } },
      ]);

      summary = data.reduce(
        (acc, item) => {
          acc.totalInvoices += item.totalInvoices;
          acc.totalPurchases += item.totalPurchases;
          acc.totalReturns += item.totalReturns;
          acc.netPurchases += item.netPurchases;
          return acc;
        },
        {
          totalSuppliers: data.length,
          totalInvoices: 0,
          totalPurchases: 0,
          totalReturns: 0,
          netPurchases: 0,
        },
      );
    }

    if (type === "product") {
      const [purchases, returns] = await Promise.all([
        PurchaseInvoice.aggregate([
          { $match: query },
          { $unwind: "$items" },
          ...(productId
            ? [
                {
                  $match: {
                    "items.product": new mongoose.Types.ObjectId(productId),
                  },
                },
              ]
            : []),
          {
            $group: {
              _id: "$items.product",
              productName: { $first: "$items.productName" },
              totalQuantity: {
                $sum: "$items.quantity",
              },
              totalPurchases: {
                $sum: "$items.total",
              },
            },
          },
        ]),

        PurchaseInvoice.aggregate([
          { $match: query },
          { $unwind: "$returnList" },
          { $unwind: "$returnList.returnedItems" },
          ...(productId
            ? [
                {
                  $match: {
                    "returnList.returnedItems.product":
                      new mongoose.Types.ObjectId(productId),
                  },
                },
              ]
            : []),
          {
            $addFields: {
              originalItem: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$items",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.product",
                          "$returnList.returnedItems.product",
                        ],
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$returnList.returnedItems.product",
              returnedQuantity: {
                $sum: "$returnList.returnedItems.quantity",
              },
              totalReturns: {
                $sum: {
                  $multiply: [
                    "$returnList.returnedItems.quantity",
                    { $ifNull: ["$originalItem.price", 0] },
                  ],
                },
              },
            },
          },
        ]),
      ]);

      const returnMap = new Map(
        returns.map((item) => [String(item._id), item]),
      );

      const productIds = purchases.map((item) => item._id).filter(Boolean);

      const products = await Product.find({
        _id: { $in: productIds },
      })
        .select("name")
        .lean();

      const productMap = new Map(
        products.map((item) => [String(item._id), item]),
      );

      data = purchases.map((item) => {
        const returned = returnMap.get(String(item._id));

        const totalReturns = returned?.totalReturns || 0;
        const returnedQuantity = returned?.returnedQuantity || 0;

        return {
          product: {
            _id: item._id,
            name: productMap.get(String(item._id))?.name || item.productName,
          },
          totalQuantity: item.totalQuantity,
          returnedQuantity,
          netQuantity: item.totalQuantity - returnedQuantity,
          totalPurchases: item.totalPurchases,
          totalReturns,
          netPurchases: item.totalPurchases - totalReturns,
        };
      });

      const allowedSort = [
        "totalQuantity",
        "returnedQuantity",
        "netQuantity",
        "totalPurchases",
        "totalReturns",
        "netPurchases",
      ];

      const safeSort = allowedSort.includes(sortBy) ? sortBy : "netPurchases";

      data.sort((a, b) => (a[safeSort] - b[safeSort]) * direction);

      summary = data.reduce(
        (acc, item) => {
          acc.totalQuantity += item.totalQuantity;
          acc.returnedQuantity += item.returnedQuantity;
          acc.netQuantity += item.netQuantity;
          acc.totalPurchases += item.totalPurchases;
          acc.totalReturns += item.totalReturns;
          acc.netPurchases += item.netPurchases;
          return acc;
        },
        {
          totalProducts: data.length,
          totalQuantity: 0,
          returnedQuantity: 0,
          netQuantity: 0,
          totalPurchases: 0,
          totalReturns: 0,
          netPurchases: 0,
        },
      );
    }

    const totalRecords = data.length;

    const totalPages =
      limit === "all"
        ? totalRecords > 0
          ? 1
          : 0
        : Math.ceil(totalRecords / Number(limit));

    const paginatedData =
      limit === "all"
        ? data
        : data.slice((page - 1) * Number(limit), page * Number(limit));

    return res.status(200).json({
      success: true,
      type,
      pagination: {
        currentPage: page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      summary,
      count: paginatedData.length,
      data: paginatedData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const { type = "daily", category, sortOrder = "desc" } = req.query;
    const { page, limit } = req.pagination;
    const filter = { ...req.dateQuery };

    const allowedTypes = ["daily", "weekly", "monthly", "category"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report type",
      });
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = new mongoose.Types.ObjectId(category);
    }

    const direction = sortOrder === "asc" ? 1 : -1;

    const getPeriodDates = (date, periodType) => {
      const start = new Date(date);
      const end = new Date(date);

      if (periodType === "daily") {
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      }

      if (periodType === "weekly") {
        const day = start.getDay();
        const difference = day === 0 ? 6 : day - 1;

        start.setDate(start.getDate() - difference);
        start.setHours(0, 0, 0, 0);

        end.setTime(start.getTime());
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
      }

      if (periodType === "monthly") {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      }

      return {
        periodStartDate: start,
        periodEndDate: end,
      };
    };

    if (type === "category") {
      const result = await Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            totalExpenses: { $sum: "$amount" },
            totalRecords: { $sum: 1 },
          },
        },
        { $sort: { totalExpenses: direction } },
      ]);

      const reportData = await Expense.populate(result, {
        path: "_id",
        model: "expenseCategory",
        select: "name",
      });

      const data = reportData.map((item) => ({
        category: {
          _id: item._id?._id || null,
          name: item._id?.name || "Unknown",
        },
        totalExpenses: item.totalExpenses,
        totalRecords: item.totalRecords,
      }));

      const total = data.length;
      const totalPages =
        limit === "all"
          ? total > 0
            ? 1
            : 0
          : Math.ceil(total / Number(limit));

      const paginatedData =
        limit === "all"
          ? data
          : data.slice((page - 1) * Number(limit), page * Number(limit));

      return res.status(200).json({
        success: true,
        type,
        period: {
          startDate: req.dateQuery.createdAt?.$gte || null,
          endDate: req.dateQuery.createdAt?.$lte || null,
        },
        summary: {
          totalExpenses: data.reduce(
            (sum, item) => sum + item.totalExpenses,
            0,
          ),
          totalRecords: data.reduce((sum, item) => sum + item.totalRecords, 0),
          totalCategories: total,
        },
        count: paginatedData.length,
        data: paginatedData,
        pagination: {
          total,
          currentPage: page,
          totalPages,
          limit,
          hasNextPage: limit === "all" ? false : page < totalPages,
          hasPrevPage: limit === "all" ? false : page > 1,
        },
      });
    }

    const unit = {
      daily: "day",
      weekly: "week",
      monthly: "month",
    }[type];

    const result = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            period: {
              $dateTrunc: {
                date: "$createdAt",
                unit,
                ...(type === "weekly" ? { startOfWeek: "monday" } : {}),
              },
            },
            category: "$category",
          },
          totalExpenses: { $sum: "$amount" },
          totalRecords: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.period": direction,
          totalExpenses: -1,
        },
      },
    ]);

    const populatedData = await Expense.populate(result, {
      path: "_id.category",
      model: "expenseCategory",
      select: "name",
    });

    const data = populatedData.map((item) => ({
      period: item._id.period,
      ...getPeriodDates(item._id.period, type),
      category: {
        _id: item._id.category?._id || null,
        name: item._id.category?.name || "Unknown",
      },
      totalExpenses: item.totalExpenses,
      totalRecords: item.totalRecords,
    }));

    const summary = data.reduce(
      (acc, item) => {
        acc.totalExpenses += item.totalExpenses;
        acc.totalRecords += item.totalRecords;
        return acc;
      },
      {
        totalExpenses: 0,
        totalRecords: 0,
        totalCategories: new Set(data.map((item) => String(item.category._id)))
          .size,
      },
    );

    const total = data.length;
    const totalPages =
      limit === "all" ? (total > 0 ? 1 : 0) : Math.ceil(total / Number(limit));

    const paginatedData =
      limit === "all"
        ? data
        : data.slice((page - 1) * Number(limit), page * Number(limit));

    return res.status(200).json({
      success: true,
      type,
      summary,
      count: paginatedData.length,
      data: paginatedData,
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

const getProductsReport = async (req, res) => {
  try {
    const { search, stockFilter } = req.query;
    const { page, limit } = req.pagination;
    const query = { ...req.dateQuery };

    if (search?.trim()) {
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

    if (stockFilter === "low-stock") {
      query.$expr = {
        $lte: [
          { $ifNull: ["$openingStock", 0] },
          { $ifNull: ["$minimumStock", 0] },
        ],
      };
    }
    const productsQuery = Product.find(query)
      .select("name sku openingStock purchasePrice minimumStock")
      .sort({ createdAt: -1 })
      .lean();

    if (limit !== "all") {
      productsQuery.skip((page - 1) * limit).limit(limit);
    }

    const [products, totalProducts] = await Promise.all([
      productsQuery,
      Product.countDocuments(query),
    ]);

    const data = products.map((product) => {
      const currentStock = Number(product.openingStock || 0);
      const unitCost = Number(product.purchasePrice || 0);

      return {
        productName: product.name,
        sku: product.sku,
        currentStock,
        unitCost,
        totalValue: currentStock * unitCost,
      };
    });

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
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSotckReports = async (req, res) => {
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
const getPaymentReports = async (req, res) => {
  try {
    const { view = "all", partyType = "all", search = "" } = req.query;
    const { page, limit } = req.pagination;

    const query = {
      ...req.dateQuery,
    };

    const allowedViews = [
      "all",
      "customerReceivables",
      "supplierPayables",
      "customerPayments",
      "supplierPayments",
    ];

    if (!allowedViews.includes(view)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction view",
      });
    }

    if (!["all", "customer", "supplier"].includes(partyType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid party type",
      });
    }

    let selectedPartyType = partyType;
    let transactionType = null;
    let reportType = "transactions";

    if (view === "customerReceivables") {
      selectedPartyType = "customer";
      reportType = "customerReceivables";
    } else if (view === "supplierPayables") {
      selectedPartyType = "supplier";
      reportType = "supplierPayables";
    } else if (view === "customerPayments") {
      selectedPartyType = "customer";
      transactionType = "payment";
      reportType = "customerPayments";
    } else if (view === "supplierPayments") {
      selectedPartyType = "supplier";
      transactionType = "payment";
      reportType = "supplierPayments";
    }

    const filter = {};

    if (selectedPartyType !== "all") {
      filter.partyType = selectedPartyType;
    }

    const records = await TransactionRecords.find(filter).lean();

    let data = [];

    if (
      reportType === "customerReceivables" ||
      reportType === "supplierPayables"
    ) {
      const isCustomer = reportType === "customerReceivables";

      const partyIds = records
        .map((record) => {
          const party = isCustomer ? record.customer : record.supplier;
          return party?.partyId;
        })
        .filter(Boolean);

      const PartyModel = isCustomer ? Customer : Supplier;

      const parties = await PartyModel.find({
        _id: { $in: partyIds },
      })
        .select("phone")
        .lean();

      const phoneMap = new Map(
        parties.map((party) => [party._id.toString(), party.phone || ""]),
      );

      data = records
        .map((record) => {
          const party = isCustomer ? record.customer : record.supplier;

          if (!party) return null;

          return {
            partyId: party.partyId,
            partyName: party.partyName,
            phone: phoneMap.get(party.partyId.toString()) || "",
            ...(isCustomer
              ? { closingReceivable: party.closingReceivable || 0 }
              : { closingPayable: party.closingPayable || 0 }),
          };
        })
        .filter(Boolean);
    } else {
      records.forEach((record) => {
        const party =
          record.partyType === "customer" ? record.customer : record.supplier;

        if (!party) return;

        const partyTransactions = (party.transactions || [])
          .filter((transaction) => {
            if (
              transactionType &&
              transaction.transactionType !== transactionType
            ) {
              return false;
            }

            const dateFilter = query.paymentDate || {};

            if (!transaction.paymentDate) {
              return !dateFilter.$gte && !dateFilter.$lte;
            }

            const transactionDate = new Date(transaction.paymentDate);

            if (Number.isNaN(transactionDate.getTime())) return false;

            if (
              dateFilter.$gte &&
              transactionDate < new Date(dateFilter.$gte)
            ) {
              return false;
            }

            if (
              dateFilter.$lte &&
              transactionDate > new Date(dateFilter.$lte)
            ) {
              return false;
            }

            return true;
          })
          .map((transaction) => ({
            ...transaction,
            date: transaction.paymentDate,
            partyType: record.partyType,
            partyId: party.partyId,
            partyName: party.partyName,
            ...(record.partyType === "customer"
              ? { receive: transaction.amount }
              : { paidOut: transaction.amount }),
          }));

        data.push(...partyTransactions);
      });
    }

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      data = data.filter(
        (item) =>
          searchRegex.test(item.partyName || "") ||
          searchRegex.test(item.phone || "") ||
          searchRegex.test(item.ref || "") ||
          searchRegex.test(item.notes || "") ||
          searchRegex.test(item.transactionType || ""),
      );
    }

    if (
      reportType !== "customerReceivables" &&
      reportType !== "supplierPayables"
    ) {
      data.sort(
        (a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0),
      );
    }

    const totalHistory = data.length;
    const totalPages = limit === "all" ? 1 : Math.ceil(totalHistory / limit);

    const startIndex = (page - 1) * (limit === "all" ? totalHistory : limit);

    const paginatedData =
      limit === "all" ? data : data.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      reportType,
      data: paginatedData,
      pagination: {
        totalHistory,
        currentPage: page,
        limit,
        totalPages,
        hasNextPage: limit !== "all" && page < totalPages,
        hasPrevPage: page > 1 && page <= totalPages,
      },
    });
  } catch (error) {
    console.error("Get Payment Reports Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
module.exports = {
  getSalesReports,
  getPurchaseReports,
  getExpenseReport,
  getProductsReport,
  getSotckReports,
  getPaymentReports,
};
