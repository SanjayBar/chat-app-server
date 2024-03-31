const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/postgres");
const userAlreadyExist = async (name) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE name = $1", [
      name,
    ]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

const createUser = async ({ name, password }) => {
  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, password) VALUES ($1, $2) RETURNING name",
      [name, hashPassword],
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const checkCredentials = async ({ name, password }) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE name = $1", [
      name,
    ]);
    if (user.rows.length === 0) {
      throw new Error("Invelid credentials");
    }
    const result = await bcrypt.compare(password, user.rows[0].password);
    if (!result) {
      throw new Error("Invelid credentials");
    }
    return user.rows[0];
  } catch (e) {
    throw e;
  }
};

const generateJwtToken = ({ name, id }) => {
  const token = jwt.sign({ id, name }, process.env.JWT_SECRET);
  return token;
};

const verifyJwtToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  userAlreadyExist,
  createUser,
  checkCredentials,
  generateJwtToken,
  verifyJwtToken,
};
