const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/register", indexController.registerGet);
indexRouter.post("/register", indexController.registerPost);
indexRouter.get("/login", indexController.loginGet);

module.exports = indexRouter;
