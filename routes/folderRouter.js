const { Router } = require("express");
const folderController = require("../controllers/folderController");

const folderRouter = Router();

folderRouter.get("/root", folderController.rootGet);
folderRouter.get("/:folderId", folderController.folderGet);

module.exports = folderRouter;
