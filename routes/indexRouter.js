const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/register", indexController.registerGet);
indexRouter.post("/register", indexController.registerPost);
indexRouter.get("/login", indexController.loginGet);
indexRouter.post("/login", indexController.loginPost);
indexRouter.use(indexController.isAuth);

module.exports = indexRouter;
