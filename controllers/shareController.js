const prisma = require("../prisma/client");
const asyncHandler = require("express-async-handler");
const middleware = require("../utils/middleware");
const CustomError = require("../utils/CustomError");

const shareRedirect = [
  asyncHandler(middleware.cleanUpSharedFolders),
  asyncHandler(async (req, res) => {
    const folderInfo = await prisma.sharedFolder.findUnique({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!folderInfo) throw new CustomError(404, "Folder Not Found.");

    res.redirect(`/share/folder/${folderInfo.folder_id}`);
  }),
];

module.exports = {
  shareRedirect,
};
