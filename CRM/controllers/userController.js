const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const killCookie = require("../utils/killCookie");

const passwordSchema = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const newUser = async (req, res) => {
  const { email, password } = req.body;
  const isPasswordValid = passwordSchema.test(password);

  const user = await User.findOne({ email });

  if (!user && isPasswordValid) {
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await User.create({ email, password: hashedPassword });
      return res.status(201).json({
        message: `New user ${email} has been successfully created`,
      });
    } catch (err) {
      return res.status(400).json({
        message: err,
      });
    }
  } else if (user) {
    res.status(400).json({
      message: "This email has already been used",
    });
  } else {
    res.status(400).json({
      message: "Please enter a valid email/password",
    });
  }
};

const getToken = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  // Password check
  const isPasswordValid = await bcrypt.compare(password, user.password);
  // If user does not exist or error in login or password doesn't match
  if (!user || !isPasswordValid) {
    return res.status(404).json({
      message:
        "Access denied. Please create an account or enter a valid email/password",
    });
  }

  // Create token and give cookie
  try {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });
    console.log("I'm here");
    res.cookie("jwt", token, { httpOnly: true, secure: false });
    /*     res.send(req.signedCookies); */
    console.log(res.cookie("jwt", token, { httpOnly: true, secure: false }));
    res.status(200).json({
      message: "Here is your delicious cookie!",
    });
  } catch (err) {
    res.status(400).json({
      message: err,
    });
  }
};

const logout = (_req, res) => {
  killCookie(res);
  res.status(200).json({
    message: "You have been logged out",
  });
};

const deleterUser = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  const userId = user._id;

  if (user && user.category !== "admin") {
    try {
      await User.deleteOne({ email });
      await Contact.deleteMany({ userId });
      res.status(200).json({
        message: "This user and its contacts has successfully been deleted",
      });
    } catch (err) {
      res.status(400).json({
        messafe: err,
      });
    }
  } else {
    res.status(403).json({
      message: "This user is also an admin. You cannot delete their profile.",
    });
  }
};

module.exports = { newUser, getToken, logout, deleterUser };
