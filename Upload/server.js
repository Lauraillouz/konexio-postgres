const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });
const upload = multer({ dest: "public/uploads" });

// Middlewares
app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", async (_req, res) => {
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
});

app.post("/user", upload.single("image"), async (req, res) => {
  // Get infos back from front
  let username = req.query.name;
  let profilePic = req.file;
  let image = req.file.destination + "/" + imgName;
  // Photo to original format
  let date = new Date();
  date = date.toLocaleDateString().replace(/\//g, "-");
  let extension = profilePic.originalname.split(".")[1];
  let imgName = `${username.toLowerCase()}-${date}.${extension}`;

  fs.renameSync(req.file.path, path.join(req.file.destination, imgName));
  // Save users
  try {
    await Postgres.query("INSERT INTO users(name, image) VALUES($1, $2)", [
      username,
      image,
    ]);

    res.json({
      status: "OK",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port 3000");
});
