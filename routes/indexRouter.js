const { Router } = require("express");
const indexController = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/register", indexController.registerGet);

module.exports = indexRouter;
