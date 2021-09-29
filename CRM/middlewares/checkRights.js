const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

const killCookie = require("../utils/killCookie");

const checkRights = async (req, res, next) => {
  try {
    const data = jwt.verify(req.cookies.jwt, process.env.JWT_SECURE);
    req.cookies.jwtData = data;

    if (Date.now() === data.exp * 1000) {
      killCookie(res);
      return res.status(403).json({
        message: "Access denied. You token is invalid",
      });
    }

    const user = await Postgres.query(
      "SELECT * FROM users_crm WHERE users_crm.id=$1",
      [data.id]
    );

    if (user.rows[0].role === "admin") {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Admin rights are required for this action.",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
};

module.exports = checkRights;
