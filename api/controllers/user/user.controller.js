const UserModel = require('../../schemas/User')
const createHttpErrors = require('http-errors')

class UserController {
  static async getUserDetail(req, res, next) {
    try {
      const user = await UserModel.findById({
        _id: req.payload.id,
        status: 'active',
      })

      if (!user) throw new createHttpErrors.NotFound('User Not Found')

      const data = user.jsonData()

      return res.status(200).json({
        data,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports= UserController
