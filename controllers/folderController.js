const asyncHandler = require("express-async-handler");
const prisma = require("../prisma/client");
const { validationResult, param } = require("express-validator");
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

module.exports = {
  rootGet,
  folderGet,
};
