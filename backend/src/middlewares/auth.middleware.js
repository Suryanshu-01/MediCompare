import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {

    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "No Authorization header",
      });
    }

    const parts = req.headers.authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Authorization format must be: Bearer <token>",
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
