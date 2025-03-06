const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Реєстрація нового користувача (лише для адміністраторів)
exports.register = async (req, res) => {
    try {
        const { username, password, name, role, branch } = req.body;

        // Перевірка наявності користувача
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з таким іменем вже існує' });
        }

        // Створення нового користувача
        const user = new User({
            username,
            password,
            name,
            role,
            branch
        });

        await user.save();

        res.status(201).json({ message: 'Користувача успішно створено' });
    } catch (error) {
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ message: 'Помилка сервера при реєстрації' });
    }
};

// Вхід користувача
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Пошук користувача
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Невірне ім\'я користувача або пароль' });
        }

        // Перевірка активності користувача
        if (!user.isActive) {
            return res.status(403).json({ message: 'Ваш обліковий запис деактивовано' });
        }

        // Перевірка пароля
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірне ім\'я користувача або пароль' });
        }

        // Оновлення часу останнього входу
        user.lastLogin = Date.now();
        await user.save();

        // Створення JWT токена
        const token = jwt.sign(
            { id: user._id, role: user.role, branch: user.branch },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                branch: user.branch
            }
        });
    } catch (error) {
        console.error('Помилка входу:', error);
        res.status(500).json({ message: 'Помилка сервера при вході' });
    }
};

// Отримання даних поточного користувача
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        res.json(user);
    } catch (error) {
        console.error('Помилка отримання користувача:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};