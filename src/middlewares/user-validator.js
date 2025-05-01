const { StatusCodes, ErrorCodes } = require('../types/response');
const { Logger } = require('../config');

const validateProfileUpdate = (req, res, next) => {
    const { name, phoneNumber } = req.body;
    const errors = [];

    if (name && name.length < 2) {
        errors.push({
            field: 'name',
            message: 'Name must be at least 2 characters long'
        });
    }

    if (phoneNumber && !/^\+?[\d\s-]{8,}$/.test(phoneNumber)) {
        errors.push({
            field: 'phoneNumber',
            message: 'Invalid phone number format'
        });
    }

    if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: ErrorCodes.INVALID_INPUT,
                details: errors
            }
        });
    }

    next();
};

module.exports = {
    validateProfileUpdate
};
