const Customer = require("../ScheemaModals/CustomerModal");
const TransactionRecords = require("../ScheemaModals/Accounts/paymentModal");

const manageCustomerLedger = async (customer, openingBalance) => {
  let account = await TransactionRecords.findOne({
    partyType: "customer",
    "customer.partyId": customer._id,
  });

  const opening = Math.abs(Number(openingBalance) || 0);

  if (!account) {
    account = new TransactionRecords({
      partyType: "customer",
      customer: {
        partyId: customer._id,
        partyName: customer.name,
        openingBalance: opening,
        closingReceivable: -opening,
        transactions: [],
      },
    });
  } else {
    account.customer.partyId = customer._id;
    account.customer.partyName = customer.name;
    account.customer.openingBalance = opening;
    account.customer.closingReceivable = -opening;
  }
  await account.save();
  return account;
};

// CREATE CUSTOMER

const createCustomer = async (req, res) => {
  let savedCustomer;
  try {
    const {
      name,
      phone,
      email,
      address,
      openingBalance = 0,
      creditLimit = 0,
      isActive = true,
    } = req.body;

    const opening = Number(openingBalance);

    if (!Number.isFinite(opening) || opening < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid opening balance",
      });
    }

    savedCustomer = await Customer.create({
      name,
      phone,
      email,
      address,
      openingBalance: opening,
      creditLimit,
      isActive,
    });

    await manageCustomerLedger(savedCustomer, opening);

    return res.status(201).json({
      success: true,
      message: "customer created successfully",
      data: savedCustomer,
    });
  } catch (error) {
    if (savedCustomer) {
      await Customer.deleteOne({ _id: savedCustomer._id });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCustomers = async (req, res) => {
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
        message: "Status must be active, inactive, or all",
      });
    }

    const query = Customer.find(filter).sort({
      createdAt: -1,
      _id: -1,
    });

    if (limit !== "all") {
      query.skip((page - 1) * limit).limit(limit);
    }

    const [customers, totalCustomers] = await Promise.all([
      query,
      Customer.countDocuments(filter),
    ]);

    const totalPages = limit === "all" ? 1 : Math.ceil(totalCustomers / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalCustomers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: limit === "all" ? false : page < totalPages,
        hasPrevPage: limit === "all" ? false : page > 1,
      },
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE CUSTOMER

const updateCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      openingBalance,
      creditLimit,
      isActive,
    } = req.body;

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (address !== undefined) customer.address = address;
    if (creditLimit !== undefined) customer.creditLimit = creditLimit;
    if (isActive !== undefined) customer.isActive = isActive;

    if (openingBalance !== undefined) {
      const opening = Number(openingBalance);

      if (!Number.isFinite(opening) || opening < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid opening balance",
        });
      }

      customer.openingBalance = opening;
    }

    await customer.save();

    const ledger = await manageCustomerLedger(
      customer,
      Number(customer.openingBalance) || 0,
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
      ledger: {
        partyName: ledger.customer.partyName,
        openingBalance: ledger.customer.openingBalance,
        closingReceivable: ledger.customer.closingReceivable,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await Customer.deleteOne({ _id: customer._id });

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
};
