const express = require('express')
const multer = require('multer')
const handleFileController = require('../../controllers/user/handleFile.controler')
const upload = multer({ dest: 'uploads/' })
const UploadRouter = express.Router()
UploadRouter.post(
  '/upload-file',
  upload.single('file'),
  handleFileController.upload
)

module.exports = UploadRouter
