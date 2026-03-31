/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Attaches user info to req.user if token is valid
 */

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

module.exports = auth;