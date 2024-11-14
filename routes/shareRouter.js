// placed before the indexRouter so we don't have to authenticate the user
const { Router } = require("express");
const shareController = require("../controllers/shareController");

const shareRouter = Router();

shareRouter.get("/:uuid", shareController.shareRedirect);
// shareRouter.get("/folder/id", shareController.folderGet);
// shareRouter.get("/file/id, shareController.fileGet");
// shareRouter.get("/file/download/id", shareController.fileDownload);

module.exports = shareRouter;
