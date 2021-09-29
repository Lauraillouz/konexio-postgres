const jwt = require("jsonwebtoken");

const killCookie = require("../utils/killCookie");

const protectData = async (req, res, next) => {
  try {
    const data = jwt.verify(req.cookies.jwt, process.env.JWT_SECURE);
    req.cookies.jwtData = data;

    if (Date.now() === data.exp * 1000) {
      killCookie(res);
      return res.status(403).json({
        message: "Access denied. Your token is invalid",
      });
    }

    const user = await User.findOne({ _id: data.id });
    if (user) {
      next();
    } else {
      res.status(403).json({
        message: "Access denied",
      });
    }
  } catch (err) {
    return res.status(401).json({
      message: err,
    });
  }
};

module.exports = protectData;
