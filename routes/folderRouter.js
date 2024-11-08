const { Router } = require("express");
const folderController = require("../controllers/folderController");

const folderRouter = Router();

folderRouter.get("/root", folderController.rootGet);
folderRouter.get("/:folderId", folderController.folderGet);
folderRouter.post("/create/:folderId", folderController.folderPost);

module.exports = folderRouter;
