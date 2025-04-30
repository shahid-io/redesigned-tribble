/**
 * @enum {string}
 */
const ErrorCodes = {
  // Auth related errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  RESTRICTED_LOCATION: 'RESTRICTED_LOCATION',
  INVALID_OTP: 'INVALID_OTP',
  USER_EXISTS: 'USER_ALREADY_EXISTS',
  
  // Validation related errors
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_PASSWORD_FORMAT: 'INVALID_PASSWORD_FORMAT',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Server related errors
  SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
};

/**
 * @enum {number}
 */
const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500
};

/**
 * @template T
 * @typedef {Object} AppSuccess
 * @property {true} success
 * @property {T} data
 */

/**
 * @typedef {Object} AppError
 * @property {false} success
 * @property {Object} error
 * @property {string} error.message
 * @property {string} [error.code]
 * @property {*} [error.details]
 */

/**
 * @template T
 * @param {T} data 
 * @returns {AppSuccess<T>}
 */
const createSuccess = (data) => ({
  success: true,
  data,
});

/**
 * @param {string} message 
 * @param {ErrorCodes} code 
 * @param {*} [details] 
 * @returns {AppError}
 */
const createError = (message, code, details) => ({
  success: false,
  error: {
    message,
    ...(code && { code }),
    ...(details && { details }),
  },
});

/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {Object} user
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field
 * @property {string} message
 */

// Change exports from ES6 to CommonJS
module.exports = {
  ErrorCodes,
  StatusCodes,
  createSuccess,
  createError
};
