var cloudinary = require('cloudinary').v2


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const uploadFile = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: 'user',
    use_filename: true,
  })
}
const destroyFile = async (public_id) => {
  return await cloudinary.uploader.destroy(public_id, {
    resource_type:'image'
  })
}

module.exports = {
  uploadFile,
  destroyFile
}
