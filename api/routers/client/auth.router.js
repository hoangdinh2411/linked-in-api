const express = require('express')
const createHttpError = require('http-errors')
const AuthController = require('../../controllers/client/auth.controller')

const Auth = express.Router()

Auth.post('/auth/register', AuthController.register)
Auth.post('/auth/login', AuthController.login)
Auth.get('/confirm/:confirmation_code', AuthController.verifyConfirmationCode)

module.exports = Auth
