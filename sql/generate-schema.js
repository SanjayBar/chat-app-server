require("dotenv").config();
const fs = require("fs");
const { Pool } = require("pg");
const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction,
});
async function executeSqlScript() {
  try {
    const sqlScript = fs.readFileSync("sql/create-schema.sql", "utf8");

    await pool.query(sqlScript);

    console.log("Table created successfully!");
  } catch (error) {
    console.error("Error executing SQL script:", error);
  } finally {
    await pool.end();
  }
}

executeSqlScript();
