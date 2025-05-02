const express = require('express');
const { AuthController } = require('../../controllers');
const { validateUserSignup, validateAuth, validateOTP } = require('../../middlewares/auth-validator');
const { countryRestrictionMiddleware } = require('../../middlewares');

/**
 * Authentication Routes
 * @module AuthRoutes
 * 
 * POST /signup - Register new user
 * POST /login - User login
 * POST /verify-otp - Verify OTP code
 * POST /resend-otp - Resend OTP code
 */
const router = express.Router();

router.post(
    '/signup',
    countryRestrictionMiddleware,
    validateUserSignup,
    AuthController.signup
);

router.post(
    '/login',
    validateAuth,
    AuthController.login
);

router.post(
    '/verify-otp',
    validateOTP,
    AuthController.verifyOTP
);

router.post(
    '/resend-otp',
    AuthController.resendOTP
);

module.exports = router;
