const { Router } = require("express");
const fileController = require("../controllers/fileController");

const fileRouter = Router();

fileRouter.post("/upload/:folderId", fileController.filePost);
fileRouter.get("/:fileId", fileController.fileGet);

module.exports = fileRouter;