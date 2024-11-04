require("dotenv");
const express = require("express");
const path = require("node:path");
const CustomError = require("./utils/CustomError");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.get("/", () => {
  throw new Error("Internal server error working!");
});

// If no routers matched the route then it is a Not Found
app.use((req, res, next) => {
  next(new CustomError(404, "Not Found"));
});
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  if (!err.statusCode) {
    err.statusCode = 500;
    err.message = "Internal Server Error";
  }

  res.status(err.statusCode).render("error", { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`File Uploader listening on port ${PORT}!`));
