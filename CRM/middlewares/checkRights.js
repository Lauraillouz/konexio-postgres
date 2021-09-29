const jwt = require("jsonwebtoken");

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
  } catch (err) {
    res.status(401).json({
      message: err,
    });
  }

  const user = await User.findOne({ _id: data.id });

  if (user.category === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Admin rights are required for this action.",
    });
  }
};

module.exports = checkRights;
