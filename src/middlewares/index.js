const errorHandler = require('./error-handler');
const { validateUserSignup, validateAuth, validateOTP } = require('./auth-validator');
const { validateProfileUpdate } = require('./user-validator');
const countryRestrictionMiddleware = require('./country-restriction-middleware');
const authMiddleware = require('./auth-middleware');
const { validateProduct } = require('./product-validator');

module.exports = {
    errorHandler,
    validateUserSignup,
    validateAuth,
    validateOTP,
    validateProfileUpdate,
    countryRestrictionMiddleware,
    authMiddleware,
    validateProduct
};
