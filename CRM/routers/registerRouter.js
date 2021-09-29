const express = require("express");
const router = express.Router();

// Controllers
const userController = require("../controllers/userController");

router.post("/", userController.newUser);

module.exports = router;
