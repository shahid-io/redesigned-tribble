const RESTRICTED_COUNTRIES = (process.env.RESTRICTED_COUNTRIES || 'Syria,Afghanistan,Iran').split(',');

const OTP_CONFIG = {
    EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY || '10'),
    LENGTH: 6
};

const AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists with this email',
    RESTRICTED_LOCATION: 'Registration not allowed from your location',
    INVALID_OTP: 'Invalid or expired OTP',
    UNVERIFIED_USER: 'Please verify your email first'
};

module.exports = {
    RESTRICTED_COUNTRIES,
    OTP_CONFIG,
    AUTH_ERRORS
};
