const BusinessSettings = require("../ScheemaModals/settingModal");

const parseDate = (value, format, endOfDay = false) => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;

    const date = new Date(value);

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    return date;
  }

  const input = String(value).trim();
  if (!input) return null;

  let year, month, day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    [year, month, day] = input.split("-").map(Number);
  } else if (/^\d{4}-\d{2}-\d{2}T/.test(input)) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return null;

    if (endOfDay && /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/.test(input)) {
      date.setUTCHours(23, 59, 59, 999);
    }

    return date;
  } else {
    const parts = input.split(/[/-]/).map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

    if (format === "DD/MM/YYYY" || format === "DD-MM-YYYY") {
      [day, month, year] = parts;
    } else if (format === "MM/DD/YYYY" || format === "MM-DD-YYYY") {
      [month, day, year] = parts;
    } else {
      [year, month, day] = parts;
    }
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const getDayStart = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDayEnd = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const dateFilter =
  (field = "createdAt") =>
  async (req, res, next) => {
    try {
      const settings = await BusinessSettings.findOne().lean();
      const systemPreferences = settings?.systemPreferences || {};

      const requestedPeriod = String(req.query.period || "")
        .trim()
        .toLowerCase();

      const period =
        requestedPeriod ||
        String(systemPreferences.defaultPeriod || "all")
          .trim()
          .toLowerCase();

      const dateFormat = systemPreferences.dateFormat || "MM/DD/YYYY";

      const queryStartDate = String(req.query.startDate || "").trim();
      const queryEndDate = String(req.query.endDate || "").trim();

      const startDate = queryStartDate || systemPreferences.customStartDate;
      const endDate = queryEndDate || systemPreferences.customEndDate;

      const globalLimit = Number(systemPreferences.paginationLimit) || 10;
      const requestedLimit = String(req.query.limit || "")
        .trim()
        .toLowerCase();

      const requestedPage = Number.parseInt(req.query.page, 10);

      req.pagination = {
        page: Math.max(1, requestedPage || 1),
        limit:
          requestedLimit === "all"
            ? "all"
            : Math.min(
                100,
                Math.max(
                  1,
                  Number.parseInt(requestedLimit, 10) > 0
                    ? Number.parseInt(requestedLimit, 10)
                    : globalLimit,
                ),
              ),
      };

      req.dateQuery = {};

      if (period === "all") {
        return next();
      }

      const now = new Date();
      const todayStart = getDayStart(now);
      const todayEnd = getDayEnd(now);

      let start;
      let end;

      switch (period) {
        case "today": {
          start = todayStart;
          end = todayEnd;
          break;
        }

        case "yesterday": {
          const yesterday = new Date(todayStart);
          yesterday.setDate(yesterday.getDate() - 1);

          start = getDayStart(yesterday);
          end = getDayEnd(yesterday);
          break;
        }

        case "last-7-days":
        case "last-15-days":
        case "last-30-days":
        case "last-60-days":
        case "last-90-days": {
          const days = Number(period.split("-")[1]);

          start = new Date(todayStart);
          start.setDate(start.getDate() - (days - 1));

          end = todayEnd;
          break;
        }

        case "last-6-months": {
          start = new Date(todayStart);
          start.setMonth(start.getMonth() - 6);

          end = todayEnd;
          break;
        }

        case "last-1-year": {
          start = new Date(todayStart);
          start.setFullYear(start.getFullYear() - 1);

          end = todayEnd;
          break;
        }

        case "custom": {
          start = parseDate(startDate, dateFormat);
          end = parseDate(endDate, dateFormat, true);

          if (startDate && !start) {
            return res.status(400).json({
              success: false,
              message: "Invalid startDate. Please use the correct date format.",
            });
          }

          if (endDate && !end) {
            return res.status(400).json({
              success: false,
              message: "Invalid endDate. Please use the correct date format.",
            });
          }

          if (start && end && start > end) {
            return res.status(400).json({
              success: false,
              message: "startDate cannot be greater than endDate",
            });
          }

          if (!start && !end) {
            return next();
          }

          break;
        }

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid period",
          });
      }

      if (start || end) {
        req.dateQuery[field] = {};

        if (start) req.dateQuery[field].$gte = start;
        if (end) req.dateQuery[field].$lte = end;
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

module.exports = { dateFilter };
