const upload = require("multer")({ dest: "public/data/" });
const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validateFolderId } = require("./folderController");
const { validationResult, param } = require("express-validator");
const CustomError = require("../utils/CustomError");
const links = require("../utils/links");

const validateFileId = () =>
  param("fileId").custom(async (fileId, { req }) => {
    const file = await prisma.file.findUnique({
      where: {
        id: Number(fileId),
      },
      include: {
        folder: true,
      },
    });

    if (!file || file.folder.user_id !== req.user.id) throw false;
  });

const filePost = [
  validateFolderId(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const folderId = Number(req.params.folderId);

    await prisma.file.create({
      data: {
        name: req.file.originalname,
        sizeInBytes: req.file.size,
        folder_id: folderId,
        url: req.file.destination,
      },
    });

    res.redirect(`/folder/${folderId}`);
  }),
];

const fileGet = [
  validateFileId(),
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
      include: {
        folder: true,
      },
    });

    file.uploadTime = `${file.upload_time.getHours()}:${file.upload_time.getMinutes()} ${file.upload_time.getDate()}.${file.upload_time.getMonth() + 1}.${file.upload_time.getFullYear()}`;

    res.render("file", { links, file });
  }),
];

module.exports = {
  filePost,
  fileGet,
};
