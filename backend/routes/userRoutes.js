const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Registration
router.post("/register", userController.createUser);

// Login
router.post("/login", userController.loginUser);

module.exports = router;
