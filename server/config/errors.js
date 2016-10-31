global.Errors = require('operational-error')({
  FailedToGenerateTokenError: 'failed to generate token',
  InternalError: 'internal error, contact us',
  InvalidTokenError: 'invalid token',
  PasswordNotMatchError: 'password not match',
  RequirePasswordError: 'password required',
  RequireTokenError: 'token required',
  RequireUsernameError: 'username required',
  TokenExpiredError: 'token expired',
  UserNotExistError: 'user not exist'
});