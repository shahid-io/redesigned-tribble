const { StatusCodes } = require('../types/response');

const validateUserSignup = (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Missing required fields',
                code: 'VAL001'
            }
        });
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Invalid email format',
                code: 'VAL002'
            }
        });
    }

    if (password.length < 6) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Password must be at least 6 characters long',
                code: 'VAL003'
            }
        });
    }

    next();
};

const validateAuth = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            error: {
                message: 'Email and password are required',
                code: 'VAL004'
            }
        });
    }

    next();
};

module.exports = {
    validateUserSignup,
    validateAuth
};
