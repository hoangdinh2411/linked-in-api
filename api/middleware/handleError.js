const fs = require('fs')

let logFile = fs.createWriteStream('errors.txt', { flags: 'a' })

module.exports = (error, req, res, next) => {
  if (
    !req.url.includes('new-access-token') &&
    error.name === 'UnauthorizedError'
  ) {
    res.json({
      success: false,
      status: 401,
      message: 'access token expired',
    })
  } else {
    res.json({
      success: false,
      status: error.status || 500,
      message: error.message,
    })
  }
}
