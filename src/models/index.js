const User = require('./user.model');
const OTP = require('./otp.model');
const Order = require('./order.model');
const Product = require('./product.model');

/**
 * Initialize all associations
 */
Object.values({ User, OTP, Order, Product })
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate({ User, OTP, Order, Product }));

module.exports = {
    User,
    OTP,
    Order,
    Product
};
