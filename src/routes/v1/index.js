const express = require('express');
const authRoutes = require('./auth-routes');
const userRoutes = require('./user-routes');
const productRoutes = require('./product-routes');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

module.exports = router;
