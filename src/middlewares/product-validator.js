const { StatusCodes, ErrorCodes } = require('../types/response');

const validateProduct = (req, res, next) => {
    const { name, type, basePrice } = req.body;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push({
            field: 'name',
            message: 'Name must be at least 2 characters long'
        });
    }

    if (!type || !['simple', 'comfortable', 'elite'].includes(type)) {
        errors.push({
            field: 'type',
            message: 'Type must be one of: simple, comfortable, elite'
        });
    }

    if (!basePrice || isNaN(basePrice) || basePrice <= 0) {
        errors.push({
            field: 'basePrice',
            message: 'Base price must be a positive number'
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
    validateProduct
};
