const express = require("express");
const router = express.Router();

// Middleware
const protectData = require("../middlewares/protectData");

// Controller
const contactsController = require("../controllers/contactsController");

// Routes
router.get("/", protectData, contactsController.getContacts);
router.post("/", protectData, contactsController.newContact);
router.put("/", protectData, contactsController.modifyContact);
router.delete("/", protectData, contactsController.deleteContact);

module.exports = router;
