const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/client");
const { validationResult, param, body } = require("express-validator");
const links = require("../utils/links");
const CustomError = require("../utils/CustomError");

const validateFolderId = () =>
  param("folderId").custom(async (folderId, { req }) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(folderId),
      },
    });

    if (!folder || folder.user_id !== req.user.id) throw false;
  });

const validateFolderName = () =>
  body("folder")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Folder name must be between 1 and 200 characters.");

const rootGet = asyncHandler(async (req, res) => {
  const rootFolder = await prisma.folder.findFirst({
    where: {
      name: "root",
      parent_id: null,
      user_id: req.user.id,
    },
  });

  res.redirect(`/folder/${rootFolder.id}`);
});

const folderGet = [
  validateFolderId(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    const folderId =
      req.params.folderId === "root" ? null : Number(req.params.folderId);
    let mainFolder = null;
    if (folderId) {
      mainFolder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });
    } else {
      mainFolder = await prisma.folder.findFirst({
        where: {
          name: "root",
          parent_id: null,
          user_id: req.user.id,
        },
      });
    }

    const folders = await prisma.folder.findMany({
      where: {
        parent_id: mainFolder.id,
      },
    });

    const files = await prisma.file.findMany({
      where: {
        folder_id: mainFolder.id,
      },
    });

    res.render("folder", {
      links,
      items: folders.concat(files),
      folder: mainFolder,
    });
  }),
];

const folderPost = [
  validateFolderId(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  },
  validateFolderName(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(400, errors.array()[0].msg);

    const folderId = Number(req.params.folderId);

    await prisma.folder.create({
      data: {
        name: req.body.folder,
        parent_id: folderId,
        user_id: req.user.id,
      },
    });

    res.redirect("/folder/" + folderId);
  }),
];

// TODO: edit folder get and post and delete, add another param check to avoid editing the root folder of a user
const folderEditGet = [
  validateFolderId(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
    });

    res.render("editFolder", {
      links,
      folder,
    });
  }),
];

module.exports = {
  rootGet,
  folderGet,
  folderPost,
  folderEditGet,
};
