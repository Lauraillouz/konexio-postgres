const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

const getAllUsers = async (_req, res) => {
  try {
    const users = await Postgres.query("SELECT * FROM users");
    res.json({
      status: "OK",
      data: users.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

const getOneUser = async (req, res) => {
  const userName = req.params.username;

  try {
    const user = await Postgres.query("SELECT * FROM users WHERE username=$1", [
      userName,
    ]);

    if (user) {
      return res.json({
        status: "OK",
        data: user.rows,
      });
    } else {
      res.json({
        status: "error",
        message: "user not found",
      });
    }
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await Postgres.query("SELECT * FROM users WHERE id=$1", [id]);

    if (user) {
      return res.json({
        status: "OK",
        data: user.rows,
      });
    } else {
      res.json({
        status: "error",
        message: "user not found",
      });
    }
    v;
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

const getUserByEmail = async (req, res) => {
  const email = req.params.email;

  try {
    const user = await Postgres.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (user) {
      res.json({
        status: "OK",
        data: user.rows,
      });
    } else {
      res.json({
        status: "error",
        message: "user not found",
      });
    }
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

const newUser = async (req, res) => {
  const newUser = req.body;
  try {
    await Postgres.query(
      "INSERT INTO users(username, email, city) VALUES($1, $2, $3)",
      [newUser.name, newUser.email, newUser.city]
    );
    res.json({
      status: "OK",
      message: "New user created",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

module.exports = {
  getAllUsers: getAllUsers,
  getOneUser: getOneUser,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
  newUser: newUser,
};
