const express = require("express");
const router = new express.Router();
const {
  userAlreadyExist,
  createUser,
  checkCredentials,
  generateJwtToken,
} = require("../services/user");

router.post("/users/register", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).send("Name and password are required");
    }
    const exist = await userAlreadyExist(name);

    if (exist) {
      return res.status(409).json({ error: "user already exist" });
    }

    const user = await createUser({ name, password });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(401).send("Invalid credentials");
    }
    const user = await checkCredentials({ name, password });
    const token = generateJwtToken(user);

    return res.status(200).json({ name: user.name, token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
