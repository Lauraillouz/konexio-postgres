const express = require("express");
const router = express.Router();

// Controller
const userController = require("../controllers/userController");

router.post("/", userController.createToken);

module.exports = router;
