const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

const killCookie = require("../utils/killCookie");

const passwordSchema = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const newUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isPasswordValid = passwordSchema.test(password);

    const user = await Postgres.query(
      "SELECT * FROM users_crm WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0 && isPasswordValid) {
      const hashedPassword = await bcrypt.hash(password, 12);

      await Postgres.query(
        "INSERT INTO users_crm(email, password) VALUES($1, $2)",
        [email, hashedPassword]
      );

      return res.status(201).json({
        message: `New user ${email} has been successfully created`,
      });
    } else if (user.rows.length !== 0) {
      return res.status(400).json({
        message: "This email has already been used",
      });
    } else {
      return res.status(400).json({
        message: "Please enter a valid email/password",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err,
    });
  }
};

const getToken = async (req, res) => {
  const { email, password } = req.body;

  // Create token and give cookie
  try {
    const user = await Postgres.query(
      "SELECT * FROM users_crm WHERE email=$1",
      [email]
    );
    console.log(user);

    // Password check
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    // If user does not exist or error in login or password doesn't match
    if (!user || !isPasswordValid) {
      return res.status(404).json({
        message:
          "Access denied. Please create an account or enter a valid email/password",
      });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, { httpOnly: true, secure: false });

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

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  const userEmail = req.body.email;
  try {
    const user = await Postgres.query("SELECT * FROM users_crm WHERE id=$1", [
      userId,
    ]);

    const userToDelete = await Postgres.query(
      "SELECT * FROM users_crm WHERE email=$1",
      [userEmail]
    );

    if (
      user.rows[0].role === "admin" &&
      userToDelete.rows[0].role !== "admin"
    ) {
      const contactsToDelete = await Postgres.query(
        "SELECT * FROM contacts_crm INNER JOIN users_contacts ON contacts_crm.id=users_contacts.contacts_crm_id INNER JOIN users_crm ON users_crm.id=users_contacts.users_crm_id WHERE users_crm.id=$1",
        [userToDelete.rows[0].id]
      );

      await Postgres.query("DELETE FROM users_contacts WHERE users_crm_id=$1", [
        userToDelete.rows[0].id,
      ]);

      contactsToDelete.rows.forEach(async (contact) => {
        let contactId = contact.contacts_crm_id;
        await Postgres.query(
          "DELETE FROM contacts_crm WHERE contacts_crm.id=$1",
          [contactId]
        );
      });

      await Postgres.query("DELETE FROM users_crm WHERE email=$1", [
        userToDelete.rows[0].email,
      ]);

      return res.status(200).json({
        message: "This user and its contacts has successfully been deleted",
      });
    } else {
      res.status(403).json({
        message: "This user is also an admin. You cannot delete their profile.",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err,
    });
  }
};

module.exports = { newUser, getToken, logout, deleteUser };
