const { expressjwt: jwt } = require('express-jwt')

const getAccessTokenFromHeaders = function (req) {
  if (!req.url.includes('new-access-token')) {
    const { authorization } = req.headers
    if (authorization && authorization.split(' ')[0] === 'Bearer') {
      const access_token = authorization.split(' ')[1]
      req.token = access_token
      return access_token
    }
    return null
  } 
}

const isRevokedCallbackUser = async function (req, token, done) {
  try {
    req.payload = token.payload
    return token === 'undefined'
  } catch (error) {
    return done('has an error')
  }
}

// 2 options algorithms HS256/RS256
const middlewareOptions = {
  optional: jwt({
    secret: process.env.JWT_USER_SECRET,
    userProperty: 'payload',
    credentialsRequired: false,
    algorithms: ['HS256'],
  }).unless({
    path: ['/auth/new-access-token'],
  }),
  user: jwt({
    secret: process.env.JWT_USER_SECRET,
    algorithms: ['HS256'],
    getToken: getAccessTokenFromHeaders,
    isRevoked: isRevokedCallbackUser,
    userProperty: 'payload',
  }),
}

module.exports = middlewareOptions
