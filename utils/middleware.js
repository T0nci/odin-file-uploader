const prisma = require("../prisma/client");

module.exports = {
  fileDownload: async (req, res) => {
    const file = await prisma.file.findUnique({
      where: {
        id: Number(req.params.fileId),
      },
    });

    const response = await require("node-fetch")(file.url);

    res.set("Content-disposition", "attachment; filename=" + file.name);
    res.send(await response.buffer());
  },
  cleanUpSharedFolders: async (req, res, next) => {
    await prisma.$executeRaw`DELETE FROM "SharedFolder" WHERE expires <= now() at time zone 'utc'`;

    next();
  },
};
