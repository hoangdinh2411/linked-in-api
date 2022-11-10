const UserModel = require('../../modules/User')
const { register, login } = require('../../validations/auth')
const createHttpErrors = require('http-errors')
const jwt = require('jsonwebtoken')
const sendConfirmationEmail = require('../../utils/nodemailer.config')
const appConfig = require('../../utils/app.config')
class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, confirmPassword } = req.body
      const { error } = register.validate({
        email,
        password,
        confirmPassword,
      })
      if (error) throw new createHttpErrors.BadRequest(error.details[0].message)
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
            success: true,
            message: 'Register Success ! Please check your email',
          })
        )
        .catch((err) => {
          throw new createHttpErrors.Conflict('Email Exits')
        })
    } catch (error) {
      next(error)
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body
      const { error } = login.validate({ email, password })
      if (error) throw new createHttpErrors.BadRequest(error.details[0].message)
      const existing_user = await UserModel.findOne({
        email: email.trim().toLowerCase(),
      })

      if (!existing_user) throw new createHttpErrors.NotFound('User Not Found')
      if (!existing_user.validatePassword(password))
        throw new createHttpErrors.Forbidden('Password Is Incorrect')
      if (existing_user.status !== 'active')
        throw new createHttpErrors.Unauthorized(
          'Pending Account. Please Verify Your Email!'
        )

      let token = await AuthController.generateToken({
        id: existing_user._id,
        full_name: existing_user.full_name,
        status: existing_user.status,
      })
      return res.status(200).send({ success: true, token })
    } catch (error) {
      next(error)
    }
  }
  static async getNewAccessToken(req, res, next) {
    try {
      const refresh_token = req.body.refresh_token
      if (!refresh_token)
        throw new createHttpErrors.BadRequest('refresh token malformed')
      let payload
      jwt.verify(
        refresh_token,
        appConfig.refresh_token_secret,
        function (err, decoded) {
          if (err) {
            throw new createHttpErrors.Unauthorized('refresh token expired')
          }
          payload = {
            id: decoded.id,
            full_name: decoded.full_name,
            status: decoded.status,
          }
        }
      )
      let new_access_token = jwt.sign(payload, appConfig.token_user_secret, {
        expiresIn: '1h',
      })
      await UserModel.findOneAndUpdate(
        {
          _id: payload.id,
          refresh_token,
        },
        {
          new_access_token,
        },
        {
          new: true,
        }
      ).then((data) => {
        if (data) {
          return res.status(200).send({ success: true, new_access_token })
        } else {
          throw new createHttpErrors.Unauthorized('invalid refresh token')
        }
      })
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
          throw new createHttpErrors[404]('User Not Found.')
        }
        user.status = 'active'
        user.confirmation_code = undefined
        user.save((err) => {
          if (err) {
            throw new Error()
          }
          return res
            .status(200)
            .send({ success: true, message: 'Verify Success' })
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
      expiresIn: '30d',
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
