const fs = require('fs')
const createHttpErrors = require('http-errors')
const { uploadFile, destroyFile } = require('../../utils/cloudinary.config')

class handleFileController {
  static async upload(req, res, next) {
    try {
      if (!req.file) throw new createHttpErrors.BadRequest('No file uploaded')
      if (req.body.public_id) {
        await destroyFile(req.body.public_id).catch(() => {
          throw new createHttpErrors.BadRequest('Cannot Upload File')
        })
      }
      await uploadFile(req.file.path)
        .then((result) => {
          const data = {
            public_id: result.public_id,
            secure_url: result.secure_url,
          }
          return res.status(200).send({
            data,
          })
        })
        .catch(() => {
          throw new createHttpErrors.BadRequest('Cannot Upload File')
        })
    } catch (error) {
      next(error)
    }
  }

  static async edit(req, res, next) {}
}

module.exports = handleFileController
