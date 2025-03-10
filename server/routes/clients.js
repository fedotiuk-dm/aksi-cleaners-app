// /server/routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { isValidObjectId } = require('mongoose');

// Отримати всіх клієнтів
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ прізвище: 1, імя: 1 });
    res.json(clients);
  } catch (err) {
    console.error('Помилка отримання клієнтів:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Створити нового клієнта
router.post('/', async (req, res) => {
  try {
    console.log('Створення нового клієнта:', req.body);
    
    // Перевірка, чи існує клієнт з таким телефоном
    const existingClient = await Client.findOne({ телефон: req.body.телефон });
    if (existingClient) {
      return res.status(400).json({ 
        message: 'Клієнт з таким номером телефону вже існує' 
      });
    }
    
    const client = new Client({
      імя: req.body.імя,
      прізвище: req.body.прізвище,
      телефон: req.body.телефон,
      email: req.body.email || '',
      адреса: req.body.адреса || '',
      примітка: req.body.примітка || '',
      знижка: Number(req.body.знижка) || 0
    });
    
    const savedClient = await client.save();
    console.log('Клієнт збережений:', savedClient);
    res.status(201).json(savedClient);
  } catch (err) {
    console.error('Помилка створення клієнта:', err);
    res.status(400).json({ message: err.message });
  }
});

// Отримати клієнта за ID
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Клієнта не знайдено' });
    }
    
    res.json(client);
  } catch (err) {
    console.error('Помилка отримання клієнта:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Оновити клієнта
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedClient) {
      return res.status(404).json({ message: 'Клієнта не знайдено' });
    }
    
    res.json(updatedClient);
  } catch (err) {
    console.error('Помилка оновлення клієнта:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Видалити клієнта
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Невірний формат ID' });
    }
    
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    
    if (!deletedClient) {
      return res.status(404).json({ message: 'Клієнта не знайдено' });
    }
    
    res.json({ message: 'Клієнт успішно видалений' });
  } catch (err) {
    console.error('Помилка видалення клієнта:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

// Пошук клієнтів за критеріями
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const regex = new RegExp(searchQuery, 'i');
    
    const clients = await Client.find({
      $or: [
        { імя: regex },
        { прізвище: regex },
        { телефон: regex },
        { email: regex }
      ]
    }).sort({ прізвище: 1, імя: 1 });
    
    res.json(clients);
  } catch (err) {
    console.error('Помилка пошуку клієнтів:', err);
    res.status(500).json({ message: 'Сталася помилка на сервері' });
  }
});

module.exports = router;