const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Реєстрація користувача (лише для адміністраторів)
router.post('/register', authMiddleware.protect, authMiddleware.admin, authController.register);

// Вхід користувача
router.post('/login', authController.login);

// Отримання даних поточного користувача
router.get('/me', authMiddleware.protect, authController.getCurrentUser);

module.exports = router;