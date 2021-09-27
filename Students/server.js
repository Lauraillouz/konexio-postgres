const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

app.use(express.json());

//Routes
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
  });
});

app.get("/students", async (_req, res) => {
  try {
    const students = await Postgres.query("SELECT * FROM students");
    res.json({
      status: "OK",
      data: students.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.post("/students", async (req, res) => {
  const newStudent = req.body.name;
  try {
    await Postgres.query("INSERT INTO students(name) VALUES ($1)", [
      newStudent,
    ]);
    const students = await Postgres.query("SELECT * FROM students");
    res.json({
      message: "Student added",
      data: students.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

// Server listening
app.listen(process.env.PORT, () => {
  console.log("Listening on port 3001");
});
