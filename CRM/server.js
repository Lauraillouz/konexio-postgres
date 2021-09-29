const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");

// Routers
const registerRouter = require("./routers/registerRouter");
const loginRouter = require("./routers/loginRouter");
const contactsRouter = require("./routers/contactsRouter");
const adminRouter = require("./routers/adminRouter");

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser());

// Home
app.get("/", (_req, res) => {
  res.json({
    message: "Hello",
  });
});

// All Routes
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/contacts", contactsRouter);
app.use("/admin", adminRouter);

// SERVER ON
app.listen(process.env.PORT, () => {
  console.log("Listening on port 3001");
});
