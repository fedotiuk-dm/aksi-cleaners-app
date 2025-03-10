// /server/routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isValidObjectId } = require('mongoose');

// Отримати всі замовлення
router.get('/', async (req, res) => {
  console.log('GET /api/orders - отримання замовлень');
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('клієнт');
    
    console.log(`Знайдено ${orders.length} замовлень`);
    res.json(orders);
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Створити нове замовлення
router.post('/', async (req, res) => {
  console.log('POST /api/orders - створення замовлення');
  console.log('Отримані дані замовлення:', JSON.stringify(req.body, null, 2));
  
  try {
    // Створюємо замовлення з даними від клієнта
    const orderData = {
      клієнт: req.body.клієнт,
      товари: Array.isArray(req.body.товари) ? req.body.товари.map(item => ({
        найменування_виробу: item.найменування_виробу || '',
        категорія: item.категорія || '',
        од_виміру: item.од_виміру || '',
        кількість: Number(item.кількість) || 1,
        колір: item.колір || '',
        базова_вартість: Number(item.базова_вартість) || 0,
        застосовані_коефіцієнти: item.застосовані_коефіцієнти || [],
        додаткові_послуги: item.додаткові_послуги || [],
        коментар: item.коментар || '',
        остаточна_вартість: Number(item.остаточна_вартість) || 0
      })) : [],
      загальна_сума: Number(req.body.загальна_сума) || 0,
      знижка: Number(req.body.знижка) || 0,
      сума_до_сплати: Number(req.body.сума_до_сплати) || 0,
      терміновість: Boolean(req.body.терміновість),
      коментар: req.body.коментар || '',
      статус: req.body.статус || 'нове'
    };
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('Замовлення успішно збережено, ID:', savedOrder._id);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Помилка створення замовлення:', error);
    res.status(400).json({ 
      error: 'Не вдалося створити замовлення',
      details: error.message 
    });
  }
});

// Отримати замовлення за ID
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const order = await Order.findById(req.params.id).populate('клієнт');

    if (!order) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(order);
  } catch (err) {
    console.error('Помилка отримання замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Оновити статус замовлення
router.patch('/:id/status', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const { статус } = req.body;

    if (!статус) {
      return res.status(400).json({ message: 'Статус не вказано' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { статус },
      { new: true }
    ).populate('клієнт');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Помилка оновлення статусу замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Оновити замовлення
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('клієнт');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Помилка оновлення замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Видалити замовлення
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Замовлення не знайдено' });
    }

    res.json({ message: 'Замовлення успішно видалено' });
  } catch (err) {
    console.error('Помилка видалення замовлення:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

module.exports = router;