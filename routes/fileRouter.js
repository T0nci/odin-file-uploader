const { Router } = require("express");
const fileController = require("../controllers/fileController");

const fileRouter = Router();

fileRouter.post("/upload/:folderId", fileController.filePost);

module.exports = fileRouter;
