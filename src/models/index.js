const User = require('./user.model');
const OTP = require('./otp.model');

// Define relationships
User.hasMany(OTP, { foreignKey: 'userId' });
OTP.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    OTP
};
