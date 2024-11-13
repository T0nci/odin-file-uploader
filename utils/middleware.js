const prisma = require("../prisma/client");
const links = require("./links");

module.exports = {
  fileGet: async (req, res) => {
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
  },
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
