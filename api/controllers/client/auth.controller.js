const UserModel = require('../../schemas/User')
const { register, login } = require('../../validations/auth')
const createError = require('http-errors')
const jwt = require('jsonwebtoken')
const sendConfirmationEmail = require('../../utils/nodemailer.config')
const appConfig = require('../../utils/app.config')
class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, confirmPassword } = req.body
      const { error } = await register.validate({
        email,
        password,
        confirmPassword,
      })
      if (error) throw new createError.BadRequest(error.details[0].message)
      const confirmation_code = await AuthController.generateConfirmationCode(
        email
      )
      let user_model = new UserModel({
        email: email.toLowerCase().trim(),
        confirmation_code,
      })

      user_model.setPassword(req.body.password)
      return user_model
        .save()
        .then((user) => {
          if (user) {
            sendConfirmationEmail(user.email, user.confirmation_code)
          }
        })
        .then(() =>
          res.status(200).send({
            status: 'success',
            message: 'Register Success ! Please check your email',
          })
        )
        .catch((err) => {
          throw new createError.Conflict('Email Exits')
        })
    } catch (error) {
      next(error)
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body
      const { error } = await login.validateAsync({ email, password })
      if (error) throw new createError.BadRequest(error.details[0].message)
      const existing_user = await UserModel.findOne({
        email: email.trim().toLowerCase(),
      })

      if (!existing_user) throw new createError.NotFound('User Not Found')
      if (!existing_user.validatePassword(password))
        throw new createError.Forbidden('Password Is Incorrect')
      if (existing_user.status !== 'active')
        throw new createError.Unauthorized(
          'Pending Account. Please Verify Your Email!'
        )

      let token = await AuthController.generateToken({
        id: existing_user._id,
        email: existing_user.email,
        status: existing_user.status,
        role: existing_user.role,
      })
      const data = existing_user.jsonData()
      data.token = token
      return res.status(200).send({ status: 'success', token })
    } catch (error) {
      next(error)
    }
  }

  static async verifyConfirmationCode(req, res, next) {
    try {
      await UserModel.findOne({
        confirmation_code: req.params.confirmation_code,
      }).then((user) => {
        if (!user) {
          throw new createError[404]('User Not Found.')
        }
        user.status = 'active'
        user.confirmation_code = undefined
        user.save((err) => {
          if (err) {
            throw new Error()
          }
          return res.status(200).send('Verify Success')
        })
      })
    } catch (error) {
      next(error)
    }
  }
  static async generateToken(payload) {
    let access_token = jwt.sign(payload, appConfig.token_user_secret, {
      expiresIn: '1h',
    })

    let refresh_token = jwt.sign(payload, appConfig.refresh_token_secret, {
      expiresIn: '7d',
    })
    await UserModel.findByIdAndUpdate(
      {
        _id: payload.id,
      },
      {
        refresh_token,
        access_token,
      },
      {
        new: true,
      }
    )
    return {
      access_token,
      refresh_token,
    }
  }

  static async generateConfirmationCode(email) {
    let code = jwt.sign(email, appConfig.token_user_secret)
    return code
  }
}

module.exports = AuthController
