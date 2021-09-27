const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// Middlewares
app.use(express.json());

// GET
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    message: "Authors API",
  });
});

app.get("/authors", async (_req, res) => {
  try {
    const authors = await Postgres.query("SELECT * FROM authors");
    res.json({
      status: "OK",
      data: authors.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.get("/authors/:id/", async (req, res) => {
  const authorId = req.params.id;
  let author;
  try {
    author = await Postgres.query("SELECT * FROM authors WHERE id=$1", [
      authorId,
    ]);
    return res.json({
      status: "OK",
      data: author.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.get("/authors/:id/books/", async (req, res) => {
  const authorId = req.params.id;
  try {
    let authorBooks = await Postgres.query(
      "SELECT books FROM authors WHERE id=$1",
      [authorId]
    );
    return res.json({
      status: "OK",
      data: authorBooks.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

// POST
app.post("/authors", async (req, res) => {
  const newAuthorInfo = req.body;

  try {
    await Postgres.query(
      "INSERT INTO authors(name, nationality, books) VALUES ($1, $2, $3)",
      [newAuthorInfo.name, newAuthorInfo.nationality, newAuthorInfo.books]
    );

    res.json({
      status: "Author created",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
