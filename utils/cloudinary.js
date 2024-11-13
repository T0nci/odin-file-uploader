const { v2: cloudinary } = require("cloudinary");

cloudinary.config();
module.exports = async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return res;
};
