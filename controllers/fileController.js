const upload = require("multer")({ dest: "public/data/" });
const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const { validateFolderId } = require("./folderController");
const { validationResult } = require("express-validator");
const CustomError = require("../utils/CustomError");

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

module.exports = {
  filePost,
};
