require("./db/config");

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "./Src/uploads")));

// Import customer routes
const { customerRouter } = require("./src/Routes/customerRoute");
app.use("/customers", customerRouter);

const { supplierRouter } = require("./src/Routes/supplierRoute");
app.use("/suppliers", supplierRouter);

const { categoryRouter } = require("./src/Routes/categoryRoute");
app.use("/categories", categoryRouter);

const { brandRouter } = require("./src/Routes/brandRoute");
app.use("/brands", brandRouter);

const { unitRouter } = require("./src/Routes/unitRoute");
app.use("/units", unitRouter);

const { productRouter } = require("./src/Routes/productRoute");
app.use("/products", productRouter);
const { salesInvoiceRouter } = require("./src/Routes/salesInvoiceRouter");
app.use("/sale-invoices", salesInvoiceRouter);

const { purchaseInvoiceRouter } = require("./src/Routes/purchaseInvoiceRouter");
app.use("/purchase-invoices", purchaseInvoiceRouter);

const { paymentRouter } = require("./src/Routes/paymentRoutes");
app.use("/payments", paymentRouter);

const { expCategoryRouter } = require("./src/Routes/expCategoryRouter");
app.use("/expense-categories", expCategoryRouter);

const { expenseRouter } = require("./src/Routes/expenseRouter");
app.use("/expenses", expenseRouter);

const { roleRouter } = require("./src/Routes/roleRoutes");
app.use("/roles", roleRouter);

const { userRouter } = require("./src/Routes/userRouter");
app.use("/users", userRouter);

const { reportRouter } = require("./src/Routes/reportRouter");
app.use("/reports", reportRouter);
const { settingRouter } = require("./src/Routes/settingRouter");
app.use("/settings", settingRouter);

const { activityLogRouter } = require("./src/Routes/activityLogRouter");
app.use("/activity-logs", activityLogRouter);

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Server running on port 3000"));
}

// Vercel ke liye ye line lazmi add karein:
module.exports = app;
// (Agar aap 'import' s
