const middlewareOptions = require('../middleware/middleware')

module.exports = function (app) {
  app.use('/client', require('./client/auth.router'))
  
  app.use('/user', middlewareOptions.user)
  app.use('/user', require('./user/user.router'))
  app.use('/user', require('./user/handleFile.router'))
}
