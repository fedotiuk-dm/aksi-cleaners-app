const express = require('express');
const router = express.Router();
const PriceList = require('../models/PriceList');
const mongoose = require('mongoose');

// API для перевірки структури даних в базі
router.get('/price-list-check', async (req, res) => {
  try {
    // Отримуємо зразки з різних категорій для перевірки
    const sample = await PriceList.findOne();
    const clothing = await PriceList.findOne({ категорія: 'одяг' });
    const coefficient = await PriceList.findOne({ категорія: 'коефіцієнти' });
    
    // Перевіряємо типи даних ключових полів
    const report = {
      sampleData: sample,
      dataTypes: {
        вартість_замовлення: typeof clothing?.вартість_замовлення,
        коефіцієнт: typeof coefficient?.коефіцієнт
      },
      counts: {
        total: await PriceList.countDocuments(),
        categories: await PriceList.distinct('категорія')
      }
    };
    
    res.json(report);
  } catch (err) {
    console.error('Помилка діагностики:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;