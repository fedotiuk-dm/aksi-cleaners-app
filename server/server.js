const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Маршрути
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth'); // Додано маршрути аутентифікації

// Конфігурація .env файлу
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Підключення до бази даних
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleaners-app')
    .then(() => console.log('MongoDB підключено'))
    .catch((err) => console.error('Помилка підключення до MongoDB:', err));

// Базовий маршрут для перевірки
app.get('/', (req, res) => {
  res.send('API для системи управління хімчисткою працює!');
});

// Маршрути API
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes); // Додано маршрути аутентифікації

// Порт для сервера
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});