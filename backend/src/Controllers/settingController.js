const BusinessSettings = require("../ScheemaModals/settingModal");
const fs = require("fs/promises");
const path = require("path");

const postBusinessSettings = async (req, res) => {
  try {
    const existingSettings = await BusinessSettings.findOne();

    if (existingSettings) {
      return res.status(200).json({
        success: true,
        message: "Business settings already exist",
        data: existingSettings,
      });
    }

    const { businessDetails, invoicePreferences, systemPreferences } = req.body;

    const settings = await BusinessSettings.create({
      businessDetails: {
        businessName: "My Business",
        phone: "",
        email: "",
        address: "",
        website: "",
        currency: "PKR",
        ...businessDetails,
      },
      invoicePreferences: {
        invoicePrefix: "INV-",
        invoiceFooter: "Thank you for your business.",
        tax: 0,
        ...invoicePreferences,
      },
      systemPreferences: {
        dateFormat: "MM/DD/YYYY",
        defaultPeriod: "all",
        paginationLimit: 10,
        ...systemPreferences,
      },
    });

    res.status(201).json({
      success: true,
      message: "Business settings created successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBusinessSettings = async (req, res) => {
  try {
    const settings = await BusinessSettings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Business settings not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Business settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBusinessSettings = async (req, res) => {
  let newImagePath = null;

  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid settings ID",
      });
    }

    const existingSettings = await BusinessSettings.findById(id);

    if (!existingSettings) {
      return res.status(404).json({
        success: false,
        message: "Business settings not found",
      });
    }

    const parseSection = (value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      }

      return value || {};
    };

    const allowedFields = {
      businessDetails: [
        "businessName",
        "phone",
        "email",
        "address",
        "website",
        "currency",
      ],
      invoicePreferences: ["invoicePrefix", "invoiceFooter", "tax"],
      systemPreferences: [
        "dateFormat",
        "defaultPeriod",
        "customStartDate",
        "customEndDate",
        "paginationLimit",
      ],
    };

    const updateData = {};

    const sections = {
      businessDetails: parseSection(req.body.businessDetails),
      invoicePreferences: parseSection(req.body.invoicePreferences),
      systemPreferences: parseSection(req.body.systemPreferences),
    };

    Object.entries(sections).forEach(([section, values]) => {
      if (values && typeof values === "object" && !Array.isArray(values)) {
        Object.entries(values).forEach(([key, value]) => {
          if (allowedFields[section].includes(key)) {
            updateData[`${section}.${key}`] = value;
          }
        });
      }
    });

    const startDate = updateData["systemPreferences.customStartDate"];
    const endDate = updateData["systemPreferences.customEndDate"];

    if (startDate !== undefined && startDate !== null && startDate !== "") {
      if (Number.isNaN(new Date(startDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid custom start date",
        });
      }
    }

    if (endDate !== undefined && endDate !== null && endDate !== "") {
      if (Number.isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid custom end date",
        });
      }
    }

    const finalStartDate =
      startDate !== undefined
        ? startDate
        : existingSettings.systemPreferences?.customStartDate;

    const finalEndDate =
      endDate !== undefined
        ? endDate
        : existingSettings.systemPreferences?.customEndDate;

    if (
      finalStartDate &&
      finalEndDate &&
      new Date(finalStartDate) > new Date(finalEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be greater than end date",
      });
    }

    if (req.file) {
      newImagePath = `http://localhost:5000/uploads/${path.basename(req.file.path)}`;
      updateData["businessDetails.logo"] = newImagePath;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings provided",
      });
    }

    const oldImagePath = existingSettings.businessDetails?.logo;

    const settings = await BusinessSettings.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (req.file && oldImagePath && oldImagePath !== newImagePath) {
      const oldPath = path.resolve(process.cwd(), oldImagePath);

      await fs.unlink(oldPath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("Old logo deletion failed:", error.message);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business settings updated successfully",
      data: settings,
    });
  } catch (error) {
    if (newImagePath) {
      await fs
        .unlink(path.resolve(process.cwd(), newImagePath))
        .catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  postBusinessSettings,
  getBusinessSettings,
  updateBusinessSettings,
};
