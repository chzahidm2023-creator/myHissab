const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET;

function protect(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Missing token.",
    });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    req.userId = userId;

    req.user = {
      id: userId,
      userId,
      _id: userId,
      role: decoded.role,
      businessId: decoded.businessId || null,
    };

    next();
  });
}

module.exports = protect;
