/**
 * @enum {string}
 */
export const ErrorCodes = {
  UNAUTHORIZED: 'AUTH001',
  INVALID_CREDENTIALS: 'AUTH002',
  REGISTRATION_FAILED: 'AUTH003',
  RESTRICTED_LOCATION: 'AUTH004',
  INVALID_OTP: 'AUTH005',
  USER_EXISTS: 'AUTH006',
  VALIDATION_ERROR: 'VAL001',
  SERVER_ERROR: 'SRV001'
};

/**
 * @enum {number}
 */
export const StatusCodes = {
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
export const createSuccess = (data) => ({
  success: true,
  data,
});

/**
 * @param {string} message 
 * @param {ErrorCodes} code 
 * @param {*} [details] 
 * @returns {AppError}
 */
export const createError = (message, code, details) => ({
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
