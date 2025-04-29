const errorHandler = require('./errorHandler');
const { validateUserSignup, validateAuth } = require('./auth-validator');

module.exports = {
    errorHandler,
    validateUserSignup,
    validateAuth
};
