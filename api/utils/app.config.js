const appConfig = {
  port: process.env.PORT,
  token_user_secret: process.env.JWT_USER_SECRET,
  token_admin_secret: process.env.JWT_ADMIN_SECRET,
  refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
}

module.exports = appConfig
