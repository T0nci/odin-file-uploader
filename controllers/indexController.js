const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../prisma/queries");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const validateRegister = () => [
  body("username")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Username must be between 1 and 20 characters long.")
    .custom((username) => /^[a-zA-Z0-9._]+$/.test(username))
    .withMessage(
      "Username must only contain letters of the alphabet, numbers, '.' and/or '_'.",
    )
    .custom(async (username) => {
      const result = await db.getUserByUsername(username);

      if (result) throw false;
    })
    .withMessage("Username already exists."),
  body("password")
    .trim()
    .isLength({ min: 6, max: 50 })
    .withMessage("Password must contain between 6 and 50 characters.")
    .custom((password) => {
      if (!/[a-z]/.test(password)) return false;
      if (!/[A-Z]/.test(password)) return false;
      if (!/[0-9]/.test(password)) return false;
      if (!/[`~!@#$%^&*()\-_=+{}[\]|\\;:'",<.>/?]/.test(password)) return false;
      return true;
    })
    .withMessage(
      "Password must contain at least: 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol.",
    ),
  body("confirm")
    .trim()
    .custom((password, { req }) => password === req.body.password)
    .withMessage("Passwords don't match."),
];

const registerGet = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/folder/root");

  return res.render("register");
};

const registerPost = [
  validateRegister(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("register", { errors: errors.array() });
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) throw err;

      await db.createUser(req.body.username, hashedPassword);

      return res.redirect("/login");
    });
  }),
];

const loginGet = (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/folder/root");

  return res.render("login");
};

const loginPost = passport.authenticate("local", {
  successRedirect: "/folder/root",
  failureRedirect: "/login",
});

const isAuth = (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect("/login");

  // If user is authenticated we call next to access other routes, otherwise we redirect to login
  next();
};

module.exports = {
  registerGet,
  registerPost,
  loginGet,
  loginPost,
  isAuth,
};
