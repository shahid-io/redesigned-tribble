const express = require('express');
const { AuthController } = require('../../controllers/index');
const { validateUserSignup, validateAuth, validateOTP } = require('../../middlewares/auth-validator');

const router = express.Router();

router.post(
    '/signup',
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
