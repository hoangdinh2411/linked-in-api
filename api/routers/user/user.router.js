const express = require('express')
const UserController = require('../../controllers/user/user.controller')

const User = express.Router()

User.get('/detail', UserController.getUserDetail)

module.exports = User
