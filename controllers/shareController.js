const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validationResult, param } = require("express-validator");
const middleware = require("../utils/middleware");
const CustomError = require("../utils/CustomError");
const links = require("../utils/links");

const validateFolderShared = () =>
  param("folderId").custom(async (folderId) => {
    const folder = await prisma.sharedFolder.findFirst({
      where: {
        folder_id: Number(folderId),
      },
    });

    if (!folder) throw false;
  });

const validateFileShared = () =>
  param("fileId").custom(async (fileId) => {
    const file = await prisma.file.findUnique({
      where: {
        id: Number(fileId),
      },
    });

    const folder = await prisma.sharedFolder.findFirst({
      where: {
        folder_id: file.folder_id,
      },
    });

    if (!folder) throw false;
  });

const shareRedirect = asyncHandler(async (req, res) => {
  const folderInfo = await prisma.sharedFolder.findUnique({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!folderInfo) throw new CustomError(404, "Folder Not Found.");

  res.redirect(`/share/folder/${folderInfo.folder_id}`);
});

const folderGet = [
  asyncHandler(middleware.cleanUpSharedFolders),
  validateFolderShared(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
  asyncHandler(async (req, res) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
    });

    const files = await prisma.file.findMany({
      where: {
        folder_id: folder.id,
      },
    });

    res.render("folderMini", { links, folder, files, currentUser: req.user });
  }),
];

const fileGet = [
  asyncHandler(middleware.cleanUpSharedFolders),
  validateFileShared(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "File Not Found.");

    next();
  }),
  asyncHandler(async (req, res) => {
    const file = await prisma.file.findUnique({
      where: {
        id: Number(req.params.fileId),
      },
    });

    file.uploadTime = `${file.upload_time.getHours()}:${file.upload_time.getMinutes()} ${file.upload_time.getDate()}.${file.upload_time.getMonth() + 1}.${file.upload_time.getFullYear()}`;

    res.render("fileMini", { links, file, currentUser: req.user });
  }),
];

module.exports = {
  shareRedirect,
  folderGet,
  fileGet,
};
