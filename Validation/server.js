const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");

// Routers
const usersRouter = require("./routers/usersRouter");

// Middlewares
app.use(express.json());

// Routes
app.use("/users", usersRouter);

// GENERAL GET
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
  });
});

// Port listening
app.listen(process.env.PORT, () => {
  console.log("Listening on port 3000");
});
