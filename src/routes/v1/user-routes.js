const express = require('express');
const { UserController } = require('../../controllers');
const { authMiddleware, validateProfileUpdate } = require('../../middlewares');

const router = express.Router();

router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, UserController.updateProfile);
router.put('/password', authMiddleware, UserController.changePassword);
router.delete('/account', authMiddleware, UserController.deleteAccount);

module.exports = router;
