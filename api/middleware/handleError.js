const fs = require('fs')

let logFile = fs.createWriteStream('errors.txt', { flags: 'a' })

module.exports = (err, req, res, next) => {
  res.status(err.status || 400).send(err.message)
  
}
