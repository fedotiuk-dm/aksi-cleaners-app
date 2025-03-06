const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    // Отримання токена з заголовка
    const token = req.header('x-auth-token');

    // Перевірка наявності токена
    if (!token) {
        return res.status(401).json({ message: 'Немає токена, доступ заборонено' });
    }

    try {
        // Верифікація токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

        // Додавання даних користувача до запиту
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Токен недійсний' });
    }
};

// Перевірка ролі (адміністратор)
exports.admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ заборонено, потрібні права адміністратора' });
    }
    next();
};