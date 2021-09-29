const express = require("express");
const router = express.Router();

// Controller
const UserController = require("../controllers/userController");

// Middleware
const checkRights = require("../middlewares/checkRights");

// Routes
router.delete("/:id", checkRights, UserController.deleteUser);

module.exports = router;
