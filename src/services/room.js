const { pool } = require("../db/postgres");

// Check if room already exist
const roomAlreadyExist = async (name) => {
  try {
    const result = await pool.query("SELECT * FROM rooms WHERE name = $1", [
      name,
    ]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
};

// Add room to database
const createRoom = async ({ name, creator_id }) => {
  try {
    const result = await pool.query(
      "INSERT INTO rooms (name, creator_id) VALUES ($1, $2) RETURNING *",
      [name, creator_id],
    );

    return result.rows[0];
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Get all rooms
const getAllRooms = async () => {
  try {
    const result = await pool.query("SELECT * FROM rooms");
    return result.rows;
  } catch (error) {
    console.error("Error getting all rooms:", error);
    throw error;
  }
};

// Get room name by id
const getRoomNameById = async (id) => {
  try {
    const result = await pool.query("SELECT name FROM rooms WHERE id = $1", [
      id,
    ]);
    return result.rows[0].name;
  } catch (error) {
    console.error("Error getting room name by id:", error);
    throw error;
  }
};

module.exports = { roomAlreadyExist, createRoom, getAllRooms, getRoomNameById };
