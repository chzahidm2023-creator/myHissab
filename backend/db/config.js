const mongoose = require("mongoose");
const dotenv = require("dotenv");

// 1. Load the environment variables from your .env file
dotenv.config();

// 2. Configure mongoose global settings
mongoose.set("strictQuery", false);

// 3. Connect using the environment variable string
const dbUrl =
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/hisbapro?replicaSet=rs0&directConnection=true";

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Successfully connected to MongoDB Replica Set!");
  })
  .catch((error) => {
    console.error("Database connection failure:", error);
  });
