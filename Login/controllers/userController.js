const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

const newUser = async (req, res) => {
  const { firstname, surname, date_of_birth, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    await Postgres.query(
      "INSERT INTO users_validation(firstname, surname, date_of_birth, email, password) VALUES ($1, $2, $3, $4, $5)",
      [firstname, surname, date_of_birth, email, hashedPassword]
    );
    res.json({
      status: "OK",
      message: "New user created",
      data: {
        firstname,
        surname,
        date_of_birth,
        email,
        password: hashedPassword,
      },
    });
  } catch (err) {
    return res.status(400).json({
      message: err,
    });
  }
};

const createToken = async (req, res) => {
  const { email, password } = req.body;

  // Does user exist
  try {
    const user = await Postgres.query(
      "SELECT * FROM users_validation WHERE email=$1",
      [email]
    );
    if (!user.rows) {
      return res.status(404).json({
        message:
          "Something went wrong. Please enter a valid email/password or create an account",
      });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!isPasswordValid) {
      return res.status(404).json({
        message:
          "Something went wrong. Please enter a valid email/password or create an account",
      });
    }

    // Go token
    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);

    // Go cookie
    res.cookie("jwt", token, { httpOnly: true, secure: false });
    res.json({
      message: "Cookie well deserved!",
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
};

const getUsers = async (_req, res) => {
  try {
    const allUsersInfo = await Postgres.query("SELECT * FROM users_validation");

    const users = allUsersInfo.rows.map((user) => {
      return {
        firstname: user.firstname,
        surname: user.surname,
        date_of_birth: user.date_of_birth,
      };
    });

    res.json({
      status: "OK",
      data: users,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports = { newUser, createToken, getUsers };
