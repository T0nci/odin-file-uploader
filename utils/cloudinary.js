const { v2: cloudinary } = require("cloudinary");

cloudinary.config();
module.exports = {
  handleUpload: async function (file) {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      asset_folder: "file_uploader",
    });
    return res;
  },
  deleteUpload: async function (public_id) {
    const res = await cloudinary.uploader.destroy(public_id);
    return res;
  },
};
