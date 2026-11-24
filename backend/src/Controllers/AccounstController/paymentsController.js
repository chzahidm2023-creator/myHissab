const TransactionRecords = require("../../ScheemaModals/Accounts/paymentModal"); // Apne model ka path yahan adjust karein

const getCustomerLedger = async (req, res) => {
  try {
    const { partyId } = req.params; // Route parameter se customer ki ID milegi
    const { startDate, endDate } = req.query; // Optional: Image ki tarah date range filter ke liye

    // Query to find customer record
    const record = await TransactionRecords.findOne({
      partyType: "customer",
      "customer.partyId": partyId,
    });

    if (!record || !record.customer) {
      return res.status(404).json({
        success: false,
        message: "Customer transaction records not found.",
      });
    }

    let transactions = record.customer.transactions || [];

    // Agar startDate aur endDate di gayi hain toh transactions filter karein (jaise image mein period start/end hai)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      transactions = transactions.filter((txn) => {
        const txnDate = new Date(txn.paymentDate);
        return txnDate >= start && txnDate <= end;
      });
    }

    // Final response jo UI/Frontend ko bheja jayega
    return res.status(200).json({
      success: true,
      data: {
        partyId: record.customer.partyId,
        partyName: record.customer.partyName,
        openingBalance: record.customer.openingBalance, // Image ki top-left card ki value
        closingReceivable: record.customer.closingReceivable, // Image ki top-right card ki value
        transactions: transactions, // Image ka transaction history table data
      },
    });
  } catch (error) {
    console.error("Error fetching customer ledger:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSupplierLedger = async (req, res) => {
  try {
    const { partyId } = req.params; // Route parameter se customer ki ID milegi
    const { startDate, endDate } = req.query; // Optional: Image ki tarah date range filter ke liye

    // Query to find customer record
    const record = await TransactionRecords.findOne({
      partyType: "supplier",
      "supplier.partyId": partyId,
    });

    if (!record || !record.supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier transaction records not found.",
      });
    }

    let transactions = record.supplier.transactions || [];

    // Agar startDate aur endDate di gayi hain toh transactions filter karein (jaise image mein period start/end hai)
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      transactions = transactions.filter((txn) => {
        const txnDate = new Date(txn.paymentDate);
        return txnDate >= start && txnDate <= end;
      });
    }

    // Final response jo UI/Frontend ko bheja jayega
    return res.status(200).json({
      success: true,
      data: {
        partyId: record.supplier.partyId,
        partyName: record.supplier.partyName,
        openingBalance: record.supplier.openingBalance, // Image ki top-left card ki value
        closingPayable: record.supplier.closingPayable, // Image ki top-right card ki value
        transactions: transactions, // Image ka transaction history table data
      },
    });
  } catch (error) {
    console.error("Error fetching supplier ledger:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const addPartyPayment = async (req, res) => {
  try {
    const {
      partyType,
      partyId,
      paymentType,
      amount,
      paymentMethod = "cash",
      paymentDate = new Date(),
      cashAccountNo,
      ref,
      notes,
    } = req.body;

    if (!["customer", "supplier"].includes(partyType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid party type",
      });
    }

    if (!["pay", "receive"].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type",
      });
    }

    if (
      !partyId ||
      !amount ||
      Number(amount) <= 0 ||
      !Number.isFinite(Number(amount))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid party ID and amount are required",
      });
    }

    const partyField = partyType;
    const balanceField =
      partyType === "customer" ? "closingReceivable" : "closingPayable";

    const account = await TransactionRecords.findOne({
      partyType,
      [`${partyField}.partyId`]: partyId,
    });

    if (!account || !account[partyField]) {
      return res.status(404).json({
        success: false,
        message: "Party account not found",
      });
    }

    const party = account[partyField];
    const paymentAmount = Number(amount);
    const isIncrease =
      (partyType === "customer" && paymentType === "pay") ||
      (partyType === "supplier" && paymentType === "receive");

    const previousBalance = Number(party[balanceField]) || 0;
    const newBalance = isIncrease
      ? previousBalance + paymentAmount
      : previousBalance - paymentAmount;

    party[balanceField] = newBalance;

    party.transactions.push({
      transactionType: "payment",
      direction: isIncrease ? "debit" : "credit",
      amount: paymentAmount,
      debit: isIncrease ? paymentAmount : 0,
      credit: isIncrease ? 0 : paymentAmount,
      runningBalance: newBalance,
      paymentMethod,
      cashAccountNo,
      paymentDate,
      ref,
      notes: notes || `${paymentType} ${partyType} payment`,
    });

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        partyId: party.partyId,
        partyName: party.partyName,
        paymentType,
        amount: paymentAmount,
        closingBalance: newBalance,
      },
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { partyType = "all", search = "" } = req.query;
    const { page, limit } = req.pagination;

    const filter = {};

    if (partyType !== "all") {
      if (!["customer", "supplier"].includes(partyType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid party type",
        });
      }
      filter.partyType = partyType;
    }

    const records = await TransactionRecords.find(filter).lean();

    let transactions = [];

    records.forEach((record) => {
      const party =
        record.partyType === "customer" ? record.customer : record.supplier;

      if (!party) return;

      const partyTransactions = (party.transactions || []).map(
        (transaction) => ({
          ...transaction,
          partyType: record.partyType,
          partyId: party.partyId,
          partyName: party.partyName,
        }),
      );

      transactions.push(...partyTransactions);
    });

    if (search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      transactions = transactions.filter(
        (transaction) =>
          searchRegex.test(transaction.partyName || "") ||
          searchRegex.test(transaction.ref || "") ||
          searchRegex.test(transaction.notes || "") ||
          searchRegex.test(transaction.transactionType || ""),
      );
    }

    const dateFilter = req.dateQuery?.paymentDate || {};

    if (dateFilter.$gte || dateFilter.$lte) {
      transactions = transactions.filter((transaction) => {
        if (!transaction.paymentDate) return false;

        const transactionDate = new Date(transaction.paymentDate);

        if (Number.isNaN(transactionDate.getTime())) return false;

        if (dateFilter.$gte && transactionDate < new Date(dateFilter.$gte)) {
          return false;
        }

        if (dateFilter.$lte && transactionDate > new Date(dateFilter.$lte)) {
          return false;
        }

        return true;
      });
    }

    transactions.sort(
      (a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0),
    );

    const total = transactions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    const paginatedTransactions = transactions.slice(
      startIndex,
      startIndex + limit,
    );

    return res.status(200).json({
      success: true,
      data: paginatedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1 && page <= totalPages,
      },
    });
  } catch (error) {
    console.error("Get Transactions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  addPartyPayment,
  getCustomerLedger,
  getSupplierLedger,
  getAllTransactions,
};
