require("dotenv");
const express = require("express");
const path = require("node:path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const CustomError = require("./utils/CustomError");
const indexRouter = require("./routes/indexRouter");

const app = express();

// STYLE
app.use(express.static(path.join(__dirname, "public")));

// EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// FORM BODY PARSING
app.use(express.urlencoded({ extended: true }));

// EXPRESS SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000,
    },
  }),
);

// PASSPORT
require("./utils/passport-setup");
app.use(passport.session());

app.use("/", indexRouter);

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
