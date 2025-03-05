const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Отримати всі замовлення
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ receivedDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Отримати одне замовлення за ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Створити нове замовлення
router.post('/', async (req, res) => {
  try {
    console.log('Отримані дані замовлення:', req.body);

    // Створюємо нове замовлення напряму, без перевірки клієнта
    const newOrder = new Order(req.body);

    // Зберігаємо замовлення
    const savedOrder = await newOrder.save();
    console.log('Замовлення збережено:', savedOrder);

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Помилка при створенні замовлення:', err);
    res.status(400).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Оновити замовлення
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Змінити статус замовлення
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Статус не вказано' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'delivered' ? { completedDate: new Date() } : {})
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;