const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/client");
const { validationResult, param, body } = require("express-validator");
const links = require("../utils/links");
const CustomError = require("../utils/CustomError");
const { cleanUpSharedFolders } = require("../utils/middleware");

const validateFolderId = () =>
  param("folderId").custom(async (folderId, { req }) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(folderId),
      },
    });

    if (!folder || folder.user_id !== req.user.id) throw false;
  });
// Using this for when uploading files
module.exports.validateFolderId = validateFolderId;

const validateFolderName = () =>
  body("folder")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Folder name must be between 1 and 200 characters.");

const validateFolderIdAndIfRoot = () =>
  validateFolderId().custom(async (folderId) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(folderId),
      },
    });

    if (folder.parent_id === null && folder.name === "root") throw false;
  });

const validateDeleteFolder = () =>
  body("folder").custom(async (folderName, { req }) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
    });

    if (folder.name !== folderName) throw false;
  });

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
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
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

const folderEditGet = [
  validateFolderIdAndIfRoot(),
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

const folderEditPost = [
  validateFolderIdAndIfRoot(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
  validateFolderName(),
  asyncHandler(async (req, res) => {
    const folderId = Number(req.params.folderId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.redirect(`/folder/edit/${folderId}`);

    const folder = await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: req.body.folder,
      },
    });

    res.redirect(`/folder/${folder.parent_id}`);
  }),
];

const folderDeletePost = [
  validateFolderIdAndIfRoot(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
  validateDeleteFolder(),
  asyncHandler(async (req, res) => {
    const folderId = Number(req.params.folderId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.redirect(`/folder/edit/${folderId}`);

    const deletedFolder = await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    res.redirect(`/folder/${deletedFolder.parent_id}`);
  }),
];

const folderShareGet = [
  validateFolderIdAndIfRoot(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new CustomError(404, "Folder Not Found.");

    next();
  }),
  asyncHandler(cleanUpSharedFolders),
  asyncHandler(async (req, res) => {
    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(req.params.folderId),
      },
      include: {
        shared: true,
      },
    });

    res.render("shareFolder", { links, folder });
  }),
];

const folderSharePost = [];

module.exports.controller = {
  rootGet,
  folderGet,
  folderPost,
  folderEditGet,
  folderEditPost,
  folderDeletePost,
  folderShareGet,
  folderSharePost,
};
