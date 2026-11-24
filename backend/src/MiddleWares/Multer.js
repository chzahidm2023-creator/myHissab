const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Ye function ab koi bhi field name as an argument le sakta hai
const uploadImage = (fieldName) => {
  return (req, resp, next) => {
    upload.single(fieldName)(req, resp, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return resp
          .status(400)
          .json({ error: err.message || "File upload failed" });
      }
      next();
    });
  };
};

module.exports = { upload, uploadImage };
