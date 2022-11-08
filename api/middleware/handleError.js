const fs = require('fs')

let logFile = fs.createWriteStream('errors.txt', { flags: 'a' })

module.exports = (error, req, res, next) => {
  console.log(error.name)
  if (error.name === 'UnauthorizedError') {
    res.json({
      status: 401,
      message: 'access token expired'
    })
  } else {
    res.json({
      status: error.status || 500,
      message: error.message
    })
  }
}
