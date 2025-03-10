// routes/priceList.js
const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const { isValidObjectId } = require('mongoose');

// Отримати всі категорії
router.get('/categories', async (req, res) => {
  try {
    const categories = await PriceList.distinct('категорія');
    res.json(categories);
  } catch (err) {
    console.error('Помилка отримання категорій:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Отримати товари за категорією з пагінацією
router.get('/category/:categoryName', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Валідація категорії
    const categoryName = req.params.categoryName.trim();

    const items = await PriceList.find({ категорія: categoryName })
      .sort({ '№': 1, найменування_виробу: 1 })
      .skip(skip)
      .limit(limit)
      .select('категорія № найменування_виробу од_виміру вартість_замовлення');

    const total = await PriceList.countDocuments({ категорія: categoryName });

    res.json({
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Помилка отримання товарів за категорією:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Пошук товарів за назвою
router.get('/search', async (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res
      .status(400)
      .json({ message: 'Необхідно вказати пошуковий термін' });
  }

  // Екранування спеціальних символів для запобігання NoSQL ін'єкцій
  const sanitizedTerm = searchTerm
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const items = await PriceList.find({
      найменування_виробу: { $regex: sanitizedTerm, $options: 'i' },
    })
      .skip(skip)
      .limit(limit)
      .select('категорія № найменування_виробу од_виміру вартість_замовлення');

    const total = await PriceList.countDocuments({
      найменування_виробу: { $regex: sanitizedTerm, $options: 'i' },
    });

    res.json({
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Помилка пошуку товарів:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Отримати товар за ID
router.get('/:id', async (req, res) => {
  try {
    // Перевірка валідності ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const item = await PriceList.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }

    res.json(item);
  } catch (err) {
    console.error('Помилка отримання товару за ID:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Отримати всі коефіцієнти
router.get('/special/coefficients', async (req, res) => {
    try {
      const coefficients = await PriceList.find({
        категорія: {
          $in: [
            'коефіцієнти',
            'додатково_для_текстильних_виробів',
            'додатково_для_шкіряних_виробів',
          ],
        },
      }).select('категорія № найменування_виробу коефіцієнт вартість_замовлення');
  
      res.json(coefficients);
    } catch (err) {
      console.error('Помилка отримання коефіцієнтів:', err);
      res.status(500).json({ message: 'Сталася помилка на сервері' });
    }
});

// Створити новий товар
router.post('/', async (req, res) => {
  try {
    const newItem = new PriceList(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Помилка створення товару:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Оновити існуючий товар
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const updatedItem = await PriceList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Помилка оновлення товару:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Видалити товар
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const deletedItem = await PriceList.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Товар не знайдено' });
    }

    res.status(200).json({ message: 'Товар успішно видалено' });
  } catch (err) {
    console.error('Помилка видалення товару:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

module.exports = router;
