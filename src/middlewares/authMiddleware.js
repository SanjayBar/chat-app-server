const { verifyJwtToken } = require("../services/user");
const { pool } = require("../db/postgres");

// validating token and authorizing user
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = verifyJwtToken(token.split(" ")[1]);
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded?.id,
    ]);

    if (!user.rows.length) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

module.exports = authMiddleware;
