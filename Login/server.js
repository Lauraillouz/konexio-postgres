const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});

// Routers
const signupRouter = require("./routers/signupRouter");
const loginRouter = require("./routers/loginRouter");
const adminRouter = require("./routers/adminRouter");

// Middlewares
app.use(express.json());

// ROUTES
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
  });
});

app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/admin", adminRouter);

// SERVER
app.listen(process.env.PORT, () => {
  console.log("Listening on port 3000");
});
