const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./plugins/db')
require('dotenv').config({
  path: './.env',
})
const createHttpErrors = require('http-errors')
const appConfig = require('./api/utils/app.config')


const app = express()
dotenv.config()
app.use(cors())
app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: false }))

app.use('/api/v1', require('./api/index'))

app.use((req, res, next) => {
  next(createHttpErrors[500]('Something wrong on server. Try again late! '))
})
app.use(require('./api/middleware/handleError'))

app.listen(appConfig.port, () => {
  db()
  console.log('The server listening on port ' + appConfig.port)
})
