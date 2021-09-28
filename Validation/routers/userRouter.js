const express = require("express");
const { sanitizeBody } = require("express-validator");
const router = express.Router();
// Libraries
const expressValidator = require("express-validator");
// Controllers
const usersController = require("../controllers/usersController");

// GET
router.get("/", usersController.getAllUsers);
router.get("/:username", usersController.getOneUser);
router.get("/id/:id", usersController.getUserById);
router.get("/email/:email", usersController.getUserByEmail);

// POST
router.post(
  "/",
  expressValidator.body("email").isEmail(),
  expressValidator
    .body("username")
    .isString()
    .custom((value) => {
      const schema = value.length > 4;
      return schema.toLowerCase();
    }),
  expressValidator.body("age").custom((value) => {
    const schema = value >= 10 && typeof value === "number";
    return schema;
  }),
  expressValidator
    .body("city")
    .not()
    .isEmpty()
    .custom((value) => {
      const schema = typeof value === "string";
      return schema.toLowerCase();
    }),
  (req, res, next) => {
    const errors = expressValidator.validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        status: "error",
        message: "Form is incorrect",
      });
    } else {
      next();
    }
  },
  sanitizeBody("email").normalizeEmail(),
  sanitizeBody("username").escape(),
  sanitizeBody("age").escape(),
  sanitizeBody("city").escape(),
  usersController.newUser
);

module.exports = router;
