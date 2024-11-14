// placed before the indexRouter so we don't have to authenticate the user
const { Router } = require("express");
const shareController = require("../controllers/shareController");

const shareRouter = Router();

shareRouter.get("/:uuid", shareController.shareRedirect);
shareRouter.get("/folder/:folderId", shareController.folderGet);
shareRouter.get("/file/:fileId", shareController.fileGet);
// shareRouter.get("/file/download/:fileId", shareController.fileDownload);

module.exports = shareRouter;
