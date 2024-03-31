const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  roomAlreadyExist,
  createRoom,
  getAllRooms,
} = require("../services/room");
const router = new express.Router();

router.get("/rooms", authMiddleware, async (req, res) => {
  try {
    const room = await getAllRooms();

    return res.status(200).json(room);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/rooms", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const user = req.user;
    if (!name) {
      return res.status(400).send("Name is required");
    }

    const exist = await roomAlreadyExist(name);

    if (exist) {
      return res.status(409).json({ error: "Room already exist" });
    }
    const room = await createRoom({ name, creator_id: user.id });

    return res.status(201).json({ name: room.name, id: room.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
