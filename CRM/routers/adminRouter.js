const express = require("express");
const router = express.Router();

// Controller
const UserController = require("../controllers/userController");

// Middleware
const checkRights = require("../middlewares/checkRights");

// Routes
router.delete("/", checkRights, UserController.deleterUser);

module.exports = router;
