const { Router } = require("express");
const folderController = require("../controllers/folderController");

const folderRouter = Router();

folderRouter.get("/root", folderController.rootGet);
folderRouter.get("/:folderId", folderController.folderGet);
folderRouter.post("/create/:folderId", folderController.folderPost);
folderRouter.get("/edit/:folderId", folderController.folderEditGet);
folderRouter.post("/edit/:folderId", folderController.folderEditPost);
folderRouter.post("/delete/:folderId", folderController.folderDeletePost);

module.exports = folderRouter;
